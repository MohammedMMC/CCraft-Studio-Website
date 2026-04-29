"use server";

import { generateToken, hashToken } from "@/lib/auth/userApiToken";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function refreshToken() {
    const { userId } = await auth();
    if (!userId) return;

    const newToken = generateToken();

    const updated = await prisma.user.updateMany({
        where: {
            clerkId: userId,
        },
        data: {
            apiToken: hashToken(newToken),
        },
    });

    if (updated.count === 0) {
        throw new Error("Unauthorized user update attempt");
    }

    return newToken;
}