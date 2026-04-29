"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import { PROJECT_LIMITS, sanitizeReviewLog } from "@/lib/projects/validation";
import { prisma } from "@/lib/prisma";
import { isZipFile } from "@/lib/functions";
import { uploadProject } from "@/lib/projects/upload";

export async function reviewProjectAction(formData: FormData): Promise<void> {
    const { userId } = await auth();
    if (!userId) return;

    const adminUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") return;

    const projectId = String(formData.get("projectId") ?? "").trim();
    const reviewMessage = sanitizeReviewLog(String(formData.get("message") ?? ""));
    const rejectedRaw = String(formData.get("rejected") ?? "false").toLowerCase();
    const rejected = rejectedRaw === "true" || rejectedRaw === "1" || rejectedRaw === "on";
    const componentsVersion = formData.get("componentsVersion");

    if (!componentsVersion || typeof componentsVersion !== "string") return;
    if (componentsVersion.length > PROJECT_LIMITS.version.max || componentsVersion.length < PROJECT_LIMITS.version.min) return;
    const projectFiles = formData.get("projectFiles") as File | null;
    if (!projectFiles || !projectId) return;
    if (projectFiles.size > PROJECT_LIMITS.projectFilesSizeBytes) return;
    if (!(await isZipFile(projectFiles))) return;

    const uploadedProject = await uploadProject({ file: projectFiles, userId, projectId, isTemp: false });

    try {
        await prisma.$transaction(async (tx) => {
            await tx.project.update({
                where: { id: projectId },
                data: { reviewed: true }
            });

            await tx.projectFiles.upsert({
                where: { projectId },
                update: {
                    componentsVersion,
                    size: uploadedProject.size,
                    pathname: uploadedProject.pathname,
                    url: uploadedProject.url,
                },
                create: {
                    projectId,
                    componentsVersion,
                    size: uploadedProject.size,
                    pathname: uploadedProject.pathname,
                    url: uploadedProject.url,
                }
            });

            await tx.reviewData.create({
                data: {
                    projectId,
                    reviewedById: adminUser.id,
                    message: reviewMessage || (rejected ? "Rejected by admin review." : "Reviewed and approved."),
                    rejected,
                },
            });
        });
    } catch (error) {
        if (!isMissingProjectTablesError(error)) {
            throw error;
        }
        return;
    }

    revalidatePath("/dashboard/admin");
    revalidatePath("/community");
    revalidatePath("/dashboard");
}
