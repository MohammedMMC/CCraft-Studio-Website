"use server";

import { syncCurrentUserToDatabase } from "@/lib/auth/sync-user";
import { prisma } from "@/lib/prisma";
import { CreateProjectFieldErrors, validateCreateProjectForm } from "@/lib/projects/validation";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export type CreateProjectActionState = {
    status: "idle" | "success" | "error";
    message: string;
    fieldErrors: CreateProjectFieldErrors;
}

type UploadedBlob = {
    url: string;
    pathname: string;
    contentType: string;
    size: number;
}

function sanitizeFilename(fileName: string): string {
    return fileName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 120) || "file";
}

function slugify(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 80);
}

async function uploadToBlob(
    file: File,
    pathname: string,
    token: string,
): Promise<UploadedBlob> {
    const uploaded = await put(pathname, file, {
        access: "private",
        token,
        addRandomSuffix: true,
        contentType: file.type || "application/octet-stream",
    });

    return {
        url: uploaded.url,
        pathname: uploaded.pathname,
        contentType: file.type || "application/octet-stream",
        size: file.size,
    };
}

export async function createProjectAction(
    _prevState: CreateProjectActionState,
    formData: FormData,
): Promise<CreateProjectActionState> {
    const { userId } = await auth();
    if (!userId) {
        return {
            status: "error",
            message: "You must be signed in to create a project.",
            fieldErrors: {},
        };
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        return {
            status: "error",
            message:
                "Server is missing BLOB_READ_WRITE_TOKEN. Add it to your .env before uploading.",
            fieldErrors: {},
        };
    }

    const validation = validateCreateProjectForm(formData);
    if (!validation.success) {
        return {
            status: "error",
            message: "Please fix the highlighted fields and try again.",
            fieldErrors: validation.errors,
        };
    }

    try {
        const user = await syncCurrentUserToDatabase();

        if (!user) {
            return {
                status: "error",
                message: "Unable to resolve the current user.",
                fieldErrors: {},
            };
        }

        const payload = validation.data;
        const timestamp = Date.now();
        const projectSlug = slugify(payload.name) || "project";
        const folder = `projects/${user.id}/${projectSlug}-${timestamp}`;

        const projectFileUpload = await uploadToBlob(
            payload.projectFile,
            `${folder}/files/${sanitizeFilename(payload.projectFile.name)}`,
            token,
        );

        const imageUploads = await Promise.all(
            payload.images.map((imageFile, index) =>
                uploadToBlob(
                    imageFile,
                    `${folder}/images/${index + 1}-${sanitizeFilename(imageFile.name)}`,
                    token,
                ),
            ),
        );

        await prisma.project.create({
            data: {
                ownerId: user.id,
                name: payload.name,
                shortDescription: payload.shortDescription,
                description: payload.description,
                version: payload.version,
                tags: payload.tags,
                projectFileUrl: projectFileUpload.url,
                projectFileName: payload.projectFile.name,
                projectFileSize: payload.projectFile.size,
                reviewed: false,
                reviewLog: "Pending admin review.",
                publishDate: payload.publishDate,
                projectUpdatedAt: payload.projectUpdatedAt,
                images: {
                    create: imageUploads.map((uploadedImage, index) => ({
                        url: uploadedImage.url,
                        pathname: uploadedImage.pathname,
                        contentType: uploadedImage.contentType,
                        size: uploadedImage.size,
                        isMain: index === payload.mainImageIndex,
                    })),
                },
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/admin");

        return {
            status: "success",
            message:
                "Project uploaded successfully. It is now in review state and will appear in Community after admin approval.",
            fieldErrors: {},
        };
    } catch (error) {
        console.error("createProjectAction failed", error);

        const message =
            process.env.NODE_ENV === "development" && error instanceof Error
                ? `Project upload failed: ${error.message}`
                : "Project upload failed. Please try again.";

        return {
            status: "error",
            message,
            fieldErrors: {},
        };
    }
}
