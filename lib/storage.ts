import { put } from "@vercel/blob";

export type UploadedBlob = {
    url: string;
    pathname: string;
    contentType: string;
    size: number;
}

const projectsStorageToken = process.env.PROJECTS_BLOB_READ_WRITE_TOKEN;
const mainStorageToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!mainStorageToken || !projectsStorageToken) {
    throw new Error("Missing blob storage tokens. File uploads will not work.");
}

export async function uploadToBlob(
    file: File,
    pathname: string,
    storageType: "main" | "projects" = "main",
): Promise<UploadedBlob> {
    const token = storageType === "projects" ? projectsStorageToken : mainStorageToken;

    if (!token) {
        throw new Error(`Missing storage token! Cannot upload file.`);
    }

    const uploaded = await put(pathname, file, {
        access: "public",
        token,
        addRandomSuffix: true,
        contentType: file.type || "application/octet-stream",
    });

    return {
        url: uploaded.url,
        pathname: uploaded.pathname,
        contentType: file.type || "application/octet-stream",
        size: file.size,
    };
}