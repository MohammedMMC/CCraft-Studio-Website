import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);
export const timeAgo = new TimeAgo("en-US");

export function sanitizeFilename(fileName: string): string {
    return fileName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 120) || "file";
}

export function slugify(input: string): string {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 80);
}

export async function isZipFile(file: File): Promise<boolean> {
    const isMimeZip = file.type === "application/zip" || file.type === "application/x-zip-compressed";
    const buffer = Buffer.from(await file.arrayBuffer());
    const isSignatureZip =
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        buffer[2] === 0x03 &&
        buffer[3] === 0x04;
    return isMimeZip && isSignatureZip;
}

export function formatDate(date: Date, fromStr: boolean = false): string {
    if (!fromStr) return date.toLocaleDateString();
    return timeAgo.format(date);
}

export function formatBytes(size: number): string {
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
}