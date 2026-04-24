"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestProjectReview(id: string, pagePath: string) {
    await prisma.project.update({
        where: { id },
        data: {
            reviewed: false,
        },
    });

    revalidatePath(pagePath);
}