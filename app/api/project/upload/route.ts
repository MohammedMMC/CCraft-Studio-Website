import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const userId = req.headers.get("x-user-id") as string;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) {
        return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    const formData = await req.formData();

    const file = formData.get("file") as File;
    const isTemp = formData.get("temp") === "true";
    const projectId = formData.get("projectId") as string | null;

    if (projectId && !isTemp && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log(file);


    const bytes = await file.arrayBuffer();

    // TODO


    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}