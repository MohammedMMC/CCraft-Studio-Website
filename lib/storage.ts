import { put, get, GetBlobResult, del } from "@vercel/blob";

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
    const access = storageType === "projects" ? "private" : "public";

    if (!token) {
        throw new Error(`Missing storage token! Cannot upload file.`);
    }

    const uploaded = await put(pathname, file, {
        access,
        token,
        addRandomSuffix: false,
        contentType: file.type || "application/octet-stream",
    });

    return {
        url: uploaded.url,
        pathname: uploaded.pathname,
        contentType: file.type || "application/octet-stream",
        size: file.size,
    };
}

export async function getFromBlob(
    pathname: string,
    storageType: "main" | "projects" = "main",
): Promise<GetBlobResult | null> {
    const token = storageType === "projects" ? projectsStorageToken : mainStorageToken;
    const access = storageType === "projects" ? "private" : "public";

    if (!token) {
        throw new Error(`Missing storage token! Cannot upload file.`);
    }

    const file = await get(pathname, { access, token });
    if (!file || file.statusCode !== 200) return null;

    return file;
}

export async function deleteFromBlob(
    pathname: string,
    storageType: "main" | "projects" = "main",
): Promise<boolean> {
    const token = storageType === "projects" ? projectsStorageToken : mainStorageToken;
    if (!token) {
        throw new Error(`Missing storage token! Cannot delete file.`);
    }
    
    try {
        await del(pathname, { token });
        return true;
    } catch (error) {
        void error;
        return false;
    }
}