"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestProjectReview(projectId: string, pagePath: string) {
    await prisma.project.update({
        where: { id: projectId },
        data: {
            reviewed: false,
        },
    });

    revalidatePath(pagePath);
}

export async function toggleProjectLike(projectId: string, userId: string, pagePath: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { likes: true },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    const newLikes = project.likes.includes(userId)
        ? project.likes.filter((id) => id !== userId)
        : [...project.likes, userId];

    await prisma.project.update({
        where: { id: projectId },
        data: { likes: newLikes },
    });

    revalidatePath(pagePath);
}

export async function addProjectDownload(projectId: string, pagePath: string) {
    await prisma.project.update({
        where: { id: projectId },
        data: {
            downloads: {
                increment: 1,
            },
        },
    });

    revalidatePath(pagePath);
}