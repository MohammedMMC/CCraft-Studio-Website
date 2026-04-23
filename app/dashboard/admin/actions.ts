"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import { sanitizeReviewLog } from "@/lib/projects/validation";
import { prisma } from "@/lib/prisma";

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

    if (!projectId) return;

    try {
        await prisma.$transaction(async (tx) => {
            const updated = await tx.project.updateMany({
                where: { id: projectId, reviewed: false, },
                data: { reviewed: true, },
            });

            if (updated.count === 0) return;

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
