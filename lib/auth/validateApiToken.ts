import { hashToken } from "@/lib/auth/userApiToken";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function validateApiToken(req: NextRequest) {
    const auth = req.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
        return {
            error: NextResponse.json({ error: "No token" }, { status: 401 }),
            user: null,
        };
    }

    const token = auth.slice(7);
    const user = await prisma.user.findUnique({
        where: { apiToken: hashToken(token) },
        select: { id: true },
    });

    if (!user) {
        return {
            error: NextResponse.json({ error: "Invalid token" }, { status: 403 }),
            user: null,
        };
    }

    return {
        error: null,
        user,
    };
}
