import { deleteFromBlob, uploadToBlob } from "../storage";

export async function uploadProject({ userId, projectId, file, isTemp = false }: {
    userId: string;
    projectId?: string;
    file: File;
    isTemp?: boolean;
}) {
    const filename = `${isTemp ? "temp" : projectId}.zip`;

    const projectFileUpload = await uploadToBlob(
        file,
        `${userId}/${filename}`,
        "projects"
    );

    return {
        url: projectFileUpload.url,
        pathname: projectFileUpload.pathname,
        name: filename,
        size: file.size,
    };
}

export async function deleteProject({ userId, projectId, isTemp = false }: {
    userId: string;
    projectId?: string;
    isTemp?: boolean;
}) {
    const filename = `${isTemp ? "temp" : projectId}.zip`;

    const result = await deleteFromBlob(
        `${userId}/${filename}`,
        "projects"
    );

    return result;
}