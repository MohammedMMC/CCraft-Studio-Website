import { prisma } from "@/lib/prisma";
import { getFromBlob } from "@/lib/storage";
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { unzipSync } from "fflate";

export async function GET(req: NextRequest, { params }: { params: Promise<{ version: string; filepath: string[] }>; }) {
    const { version, filepath } = await params;
    if (!version || version.trim() === "") notFound();
    const pathArray = Array.isArray(filepath) ? filepath : [String(filepath)];
    if (!pathArray.length) notFound();
    const requestedPath = pathArray.join("/");

    const versionData = await prisma.componentsVersions.findUnique({
        where: { version },
        select: { pathname: true, version: true },
    });
    if (!versionData) notFound();

    const file = await getFromBlob(versionData.pathname, "projects");
    if (!file || !file.blob || !(file.blob.contentType === "application/zip" || file.blob.contentType === "application/x-zip-compressed")) {
        notFound();
    }

    const arrayBuffer = await new Response(file.stream).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const unzipped = unzipSync(buffer);

    const matchKey = Object.keys(unzipped).find((k) => k === requestedPath || k === `./${requestedPath}` || k === `/${requestedPath}`);
    if (!matchKey) notFound();

    const content = Buffer.from(unzipped[matchKey]);
    const contentType = (() => {
        const ext = matchKey.split('.').pop()?.toLowerCase();
        if (!ext) return 'application/octet-stream';
        switch (ext) {
            case 'lua': return 'text/plain; charset=utf-8';
            case 'txt': return 'text/plain; charset=utf-8';
            case 'json': return 'application/json';
            case 'png': return 'image/png';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'gif': return 'image/gif';
            case 'zip': return 'application/zip';
            default: return 'application/octet-stream';
        }
    })();

    return new Response(content, {
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${matchKey.split('/').pop()}"`,
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    });
}
