import { isZipFile } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { uploadProject } from "@/lib/projects/upload";
import { PROJECT_LIMITS } from "@/lib/projects/validation";
import { getSiteUrl } from "@/lib/site-url";
import { NextRequest, NextResponse } from "next/server";

const siteUrl = getSiteUrl();

export async function POST(req: NextRequest) {
    const userId = req.headers.get("x-user-id") as string;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) {
        return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const componentsVersion = formData.get("componentsVersion") as string;

    if (!componentsVersion) {
        return NextResponse.json({ error: "Components version is required" }, { status: 400 });
    }

    if (componentsVersion.length > PROJECT_LIMITS.version.max || componentsVersion.length < PROJECT_LIMITS.version.min) {
        return NextResponse.json({ error: "Components version is too long or short" }, { status: 400 });
    }

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.size > PROJECT_LIMITS.projectFilesSizeBytes) {
        return NextResponse.json({ error: "Project file is too large" }, { status: 400 });
    }
    if (!(await isZipFile(file))) {
        return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
    }

    const project = await uploadProject({ file, userId, isTemp: true });

    const updatedTempFiles = await prisma.tempProjectFiles.upsert({
        where: { userId: userId },
        update: {
            url: project.url,
            size: project.size,
            pathname: project.pathname,
            componentsVersion: componentsVersion,
        },
        create: {
            userId: userId,
            url: project.url,
            size: project.size,
            pathname: project.pathname,
            componentsVersion: componentsVersion,
        },
    });

    return NextResponse.json({ url: `${siteUrl}/projects/${encodeURIComponent(updatedTempFiles.id)}/dw` });
}