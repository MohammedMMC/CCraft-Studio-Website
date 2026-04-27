"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestProjectReview(projectId: string, pagePath: string) {
    const { userId } = await auth();
    if (!userId) return;

    const updated = await prisma.project.updateMany({
        where: {
            id: projectId,
            owner: {
                is: {
                    clerkId: userId,
                },
            },
        },
        data: {
            reviewed: false,
        },
    });

    if (updated.count === 0) {
        throw new Error("Unauthorized project update attempt");
    }

    revalidatePath(pagePath);
}

export async function toggleProjectLike(projectId: string, pagePath: string) {
    const { userId } = await auth();
    if (!userId) return;

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, },
    });
    if (!user) return;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { likes: true },
    });

    if (!project) {
        throw new Error("Project not found");
    }

    const newLikes = project.likes.includes(user.id)
        ? project.likes.filter((id) => id !== user.id)
        : [...project.likes, user.id];

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

export async function deleteProject(projectId: string) {
    const { userId } = await auth();
    if (!userId) return;

    const deleted = await prisma.project.deleteMany({
        where: {
            id: projectId,
            owner: {
                is: {
                    clerkId: userId,
                },
            },
        },
    });

    if (deleted.count === 0) {
        throw new Error("Unauthorized project delete attempt");
    }

    redirect("/dashboard");
}