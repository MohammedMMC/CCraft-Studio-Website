"use server";

import { syncCurrentUserToDatabase } from "@/lib/auth/sync-user";
import { prisma } from "@/lib/prisma";
import { CreateProjectFieldErrors, validateCreateProjectForm, validateUpdateProjectForm } from "@/lib/projects/validation";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

function isNextRedirectError(error: unknown): boolean {
    return Boolean(
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof (error as { digest?: unknown }).digest === "string" &&
        (error as { digest: string }).digest.includes("NEXT_REDIRECT"),
    );
}

async function uploadToBlob(
    file: File,
    pathname: string,
    token: string,
): Promise<UploadedBlob> {
    const uploaded = await put(pathname, file, {
        access: "public",
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
            `${folder}/files/${sanitizeFilename(payload.name + "-" + payload.version + ".ccproj")}`,
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

        const createdProject = await prisma.project.create({
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
            select: {
                id: true,
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/admin");

        redirect(`/projects/${createdProject.id}#settings`);
    } catch (error) {
        if (isNextRedirectError(error)) {
            throw error;
        }

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

export async function updateProjectAction(
    _prevState: CreateProjectActionState,
    formData: FormData,
): Promise<CreateProjectActionState> {
    const { userId } = await auth();
    if (!userId) {
        return {
            status: "error",
            message: "You must be signed in to edit a project.",
            fieldErrors: {},
        };
    }

    const projectId = String(formData.get("projectId") ?? "").trim();
    if (!projectId) {
        return {
            status: "error",
            message: "Missing project id for update.",
            fieldErrors: {},
        };
    }

    const validation = validateUpdateProjectForm(formData);
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

        const existingProject = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                ownerId: true,
                images: {
                    orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
                    select: { id: true },
                },
            },
        });

        if (!existingProject || existingProject.ownerId !== user.id) {
            return {
                status: "error",
                message: "You do not have permission to edit this project.",
                fieldErrors: {},
            };
        }

        const payload = validation.data;
        const shouldUploadProjectFile = Boolean(payload.projectFile);
        const shouldReplaceImages = payload.images.length > 0;

        let nextProjectFile:
            | {
                url: string;
                name: string;
                size: number;
            }
            | undefined;

        let nextImages:
            | Array<{
                url: string;
                pathname: string;
                contentType: string;
                size: number;
                isMain: boolean;
            }>
            | undefined;

        if (shouldUploadProjectFile || shouldReplaceImages) {
            const token = process.env.BLOB_READ_WRITE_TOKEN;
            if (!token) {
                return {
                    status: "error",
                    message:
                        "Server is missing BLOB_READ_WRITE_TOKEN. Add it to your .env before uploading.",
                    fieldErrors: {},
                };
            }

            const folder = `projects/${user.id}/updates/${projectId}-${Date.now()}`;

            if (shouldUploadProjectFile && payload.projectFile) {
                const projectFileUpload = await uploadToBlob(
                    payload.projectFile,
                    `${folder}/files/${sanitizeFilename(payload.name + "-" + payload.version + ".ccproj")}`,
                    token,
                );

                nextProjectFile = {
                    url: projectFileUpload.url,
                    name: payload.projectFile.name,
                    size: payload.projectFile.size,
                };
            }

            if (shouldReplaceImages) {
                const imageUploads = await Promise.all(
                    payload.images.map((imageFile, index) =>
                        uploadToBlob(
                            imageFile,
                            `${folder}/images/${index + 1}-${sanitizeFilename(imageFile.name)}`,
                            token,
                        ),
                    ),
                );

                nextImages = imageUploads.map((uploadedImage, index) => ({
                    url: uploadedImage.url,
                    pathname: uploadedImage.pathname,
                    contentType: uploadedImage.contentType,
                    size: uploadedImage.size,
                    isMain: index === payload.mainImageIndex,
                }));
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.project.update({
                where: { id: projectId },
                data: {
                    name: payload.name,
                    shortDescription: payload.shortDescription,
                    description: payload.description,
                    version: payload.version,
                    tags: payload.tags,
                    projectUpdatedAt: payload.projectUpdatedAt,
                    reviewed: false,
                    ...(nextProjectFile
                        ? {
                            projectFileUrl: nextProjectFile.url,
                            projectFileName: nextProjectFile.name,
                            projectFileSize: nextProjectFile.size,
                        }
                        : {}),
                },
            });

            if (nextImages) {
                await tx.projectImage.deleteMany({ where: { projectId } });
                await tx.projectImage.createMany({
                    data: nextImages.map((image) => ({
                        projectId,
                        url: image.url,
                        pathname: image.pathname,
                        contentType: image.contentType,
                        size: image.size,
                        isMain: image.isMain,
                    })),
                });
            } else if (existingProject.images.length > 0) {
                const targetMainImage = existingProject.images[payload.mainImageIndex] ?? existingProject.images[0];

                await tx.projectImage.updateMany({
                    where: { projectId },
                    data: { isMain: false },
                });

                await tx.projectImage.update({
                    where: { id: targetMainImage.id },
                    data: { isMain: true },
                });
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/admin");
        revalidatePath("/community");
        revalidatePath(`/projects/${projectId}`);

        redirect(`/projects/${projectId}#settings`);
    } catch (error) {
        if (isNextRedirectError(error)) {
            throw error;
        }

        console.error("updateProjectAction failed", error);

        const message =
            process.env.NODE_ENV === "development" && error instanceof Error
                ? `Project update failed: ${error.message}`
                : "Project update failed. Please try again.";

        return {
            status: "error",
            message,
            fieldErrors: {},
        };
    }
}
