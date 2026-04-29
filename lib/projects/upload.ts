import { sanitizeFilename } from "../functions";
import { uploadToBlob } from "../storage";


export async function uploadProject({userId, projectId, file, isTemp = false}: {
    userId: string;
    projectId?: string;
    file: File;
    isTemp?: boolean;
}) {
    const folder = `${isTemp ? "temp" : "projects"}/${userId}/`;

    if (file) {
        const projectFileUpload = await uploadToBlob(
            file,
            `${folder}/files/${sanitizeFilename(file.name)}`,
            "projects",
        );

        return {
            url: projectFileUpload.url,
            name: file.name,
            size: file.size,
        };
    }
}