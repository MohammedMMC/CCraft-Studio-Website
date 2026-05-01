import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const userId = req.headers.get("x-user-id") as string;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, firstName: true } });
    if (!user) {
        return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }
    return NextResponse.json({ userId: user.id, firstName: user.firstName }, { status: 200 });
}