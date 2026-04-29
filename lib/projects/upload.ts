import { uploadToBlob } from "../storage";

export async function uploadProject({ userId, projectId, file, isTemp = false }: {
    userId: string;
    projectId?: string;
    file: File;
    isTemp?: boolean;
}) {
    const filename = `${isTemp ? "temp" : projectId}.zip`;

    const projectFileUpload = await uploadToBlob(
        file,
        `${userId}/files/${filename}`,
        "projects",
    );

    return {
        url: projectFileUpload.url,
        pathname: projectFileUpload.pathname,
        name: filename,
        size: file.size,
    };
}