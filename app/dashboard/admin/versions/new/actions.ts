"use server";

import { isZipFile } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { PROJECT_LIMITS } from "@/lib/projects/validation";
import { uploadToBlob } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateVersionActionState = {
    status: "idle" | "success" | "error";
    message: string;
}


export async function createVersionAction(
    _prevState: CreateVersionActionState,
    formData: FormData,
): Promise<CreateVersionActionState> {
    const version = String(formData.get("version") ?? "").trim();
    const componentsFiles = formData.get("componentsFiles") as File | null;

    if (!version || !componentsFiles) {
        return {
            status: "error",
            message: "Version and components files are required.",
        };
    }

    if (version.length < PROJECT_LIMITS.version.min || version.length > PROJECT_LIMITS.version.max) {
        return {
            status: "error",
            message: `Version must be between ${PROJECT_LIMITS.version.min} and ${PROJECT_LIMITS.version.max} characters.`,
        };
    }

    if (componentsFiles.size > PROJECT_LIMITS.projectFilesSizeBytes) {
        return {
            status: "error",
            message: "Components files are too large.",
        };
    }

    if (!(await isZipFile(componentsFiles))) {
        return {
            status: "error",
            message: "Components files must be a ZIP archive.",
        };
    }

    const existingVersion = await prisma.componentsVersions.findUnique({ where: { version } });

    if (existingVersion) {
        return {
            status: "error",
            message: "A version with that name already exists.",
        };
    }

    const versionFiles = await uploadToBlob(componentsFiles, `componentsVersions/${version}.zip`, "projects");

    await prisma.componentsVersions.create({
        data: {
            pathname: versionFiles.pathname,
            url: versionFiles.url,
            size: componentsFiles.size,
            version,
        },
    });

    revalidatePath("/dashboard/admin");
    redirect("/dashboard/admin");
}