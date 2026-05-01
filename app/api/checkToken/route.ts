import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validateApiToken } from "@/lib/auth/validateApiToken";

export async function POST(req: NextRequest) {
    const validation = await validateApiToken(req);
    if (validation.error) {
        return validation.error;
    }

    const user = await prisma.user.findUnique({
        where: { id: validation.user.id },
        select: { id: true, role: true, firstName: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    return NextResponse.json({ userId: user.id, firstName: user.firstName }, { status: 200 });
}