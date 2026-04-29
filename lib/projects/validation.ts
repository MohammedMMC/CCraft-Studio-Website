const PLAIN_TEXT_CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F]/g;
const SCRIPT_TAG_PATTERN = /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi;
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript\s*:/gi;
const VERSION_PATTERN = /^[0-9A-Za-z._-]+$/;
const TAG_PATTERN = /^[a-z0-9][a-z0-9-_/]*$/i;

export const PROJECT_LIMITS = {
    name: { min: 3, max: 80 },
    shortDescription: { min: 20, max: 240 },
    description: { min: 80, max: 20000 },
    version: { min: 1, max: 32 },
    tags: { minCount: 1, maxCount: 6, minLength: 2, maxLength: 12 },
    links: { max: 500 },
    reviewLog: { max: 2500 },
    maxImages: 8,
    maxImageSizeBytes: 8 * 1024 * 1024,
    maxProjectFileSizeBytes: 40 * 1024 * 1024,
    projectFilesSizeBytes: 1024 * 1024,
} as const;

const ALLOWED_IMAGE_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
]);

export type CreateProjectFieldErrors = Partial<{
    name: string;
    shortDescription: string;
    description: string;
    version: string;
    tags: string;
    projectFile: string;
    images: string;
    mainImageIndex: string;
}>;

export type ValidatedCreateProjectInput = {
    name: string;
    shortDescription: string;
    description: string;
    version: string;
    tags: string[];
    publishDate: Date;
    projectUpdatedAt: Date;
    projectFile: File;
    images: File[];
    mainImageIndex: number;
};

export type ValidatedUpdateProjectInput = {
    name: string;
    shortDescription: string;
    description: string;
    version: string;
    tags: string[];
    projectUpdatedAt: Date;
    projectFile: File | null;
    images: File[];
    existingImagesCount: number;
    mainImageIndex: number;
};

function isFileEntry(value: FormDataEntryValue | null): value is File {
    return typeof File !== "undefined" && value instanceof File;
}

function sanitizePlainText(input: string): string {
    return input
        .replace(PLAIN_TEXT_CONTROL_CHARS, "")
        .replace(/[<>]/g, "")
        .trim();
}

function sanitizeMarkdown(input: string): string {
    return input
        .replace(PLAIN_TEXT_CONTROL_CHARS, "")
        .replace(SCRIPT_TAG_PATTERN, "")
        .replace(JAVASCRIPT_PROTOCOL_PATTERN, "")
        .trim();
}

export function sanitizeReviewLog(input: string): string {
    return sanitizePlainText(input).slice(0, PROJECT_LIMITS.reviewLog.max);
}

function toTags(
    value: FormDataEntryValue | null,
    errors: CreateProjectFieldErrors,
): string[] {
    const raw = typeof value === "string" ? value : "";

    const tags = raw
        .split(",")
        .map((tag) => sanitizePlainText(tag).toLowerCase())
        .filter(Boolean);

    const uniqueTags = [...new Set(tags)];

    if (uniqueTags.length < PROJECT_LIMITS.tags.minCount) {
        errors.tags = `Add at least ${PROJECT_LIMITS.tags.minCount} tag.`;
        return [];
    }

    if (uniqueTags.length > PROJECT_LIMITS.tags.maxCount) {
        errors.tags = `You can add up to ${PROJECT_LIMITS.tags.maxCount} tags.`;
        return [];
    }

    const invalidTag = uniqueTags.find(
        (tag) =>
            tag.length < PROJECT_LIMITS.tags.minLength ||
            tag.length > PROJECT_LIMITS.tags.maxLength ||
            !TAG_PATTERN.test(tag),
    );

    if (invalidTag) {
        errors.tags =
            "Tags must be 2-24 characters and can use letters, numbers, -, _, /.";
        return [];
    }

    return uniqueTags;
}

function normalizeImages(
    values: FormDataEntryValue[],
    errors: CreateProjectFieldErrors,
): File[] {
    const files = values.filter(isFileEntry).filter((file) => file.size > 0);

    if (files.length === 0) {
        errors.images = "Upload at least one project image.";
        return [];
    }

    if (files.length > PROJECT_LIMITS.maxImages) {
        errors.images = `You can upload up to ${PROJECT_LIMITS.maxImages} images.`;
        return [];
    }

    const invalidImage = files.find(
        (file) =>
            !ALLOWED_IMAGE_TYPES.has(file.type) ||
            file.size > PROJECT_LIMITS.maxImageSizeBytes,
    );

    if (invalidImage) {
        errors.images =
            "Images must be PNG, JPG, WEBP, or GIF and each must be under 8MB.";
        return [];
    }

    return files;
}

export function validateCreateProjectForm(
    formData: FormData,
):
    | { success: true; data: ValidatedCreateProjectInput }
    | { success: false; errors: CreateProjectFieldErrors } {
    const errors: CreateProjectFieldErrors = {};

    const name = sanitizePlainText(String(formData.get("name") ?? ""));
    if (
        name.length < PROJECT_LIMITS.name.min ||
        name.length > PROJECT_LIMITS.name.max
    ) {
        errors.name = `Project name must be ${PROJECT_LIMITS.name.min}-${PROJECT_LIMITS.name.max} characters.`;
    }

    const shortDescription = sanitizePlainText(
        String(formData.get("shortDescription") ?? ""),
    );
    if (
        shortDescription.length < PROJECT_LIMITS.shortDescription.min ||
        shortDescription.length > PROJECT_LIMITS.shortDescription.max
    ) {
        errors.shortDescription =
            `Short description must be between ${PROJECT_LIMITS.shortDescription.min}-${PROJECT_LIMITS.shortDescription.max} characters.`;
    }

    const description = sanitizeMarkdown(String(formData.get("description") ?? ""));
    if (
        description.length < PROJECT_LIMITS.description.min ||
        description.length > PROJECT_LIMITS.description.max
    ) {
        errors.description =
            `Description must be between ${PROJECT_LIMITS.description.min}-${PROJECT_LIMITS.description.max} characters.`;
    }

    const version = sanitizePlainText(String(formData.get("version") ?? ""));
    if (
        version.length < PROJECT_LIMITS.version.min ||
        version.length > PROJECT_LIMITS.version.max ||
        !VERSION_PATTERN.test(version)
    ) {
        errors.version =
            "Version must use letters, numbers, dots, underscores, or dashes.";
    }

    const tags = toTags(formData.get("tags"), errors);

    const publishDate = new Date();
    const projectUpdatedAt = new Date(publishDate);

    const projectFileEntry = formData.get("projectFile");
    const projectFile = isFileEntry(projectFileEntry) ? projectFileEntry : null;

    if (!projectFile || projectFile.size === 0) {
        errors.projectFile = "Upload a .ccproj file.";
    } else {
        if (!projectFile.name.toLowerCase().endsWith(".ccproj")) {
            errors.projectFile = "Only .ccproj files are allowed.";
        }

        if (projectFile.size > PROJECT_LIMITS.maxProjectFileSizeBytes) {
            errors.projectFile =
                "Project file exceeds 40MB. Please upload a smaller file.";
        }
    }

    const images = normalizeImages(formData.getAll("images"), errors);

    const rawMainImageIndex = String(formData.get("mainImageIndex") ?? "0").trim();
    const mainImageIndex = Number.parseInt(rawMainImageIndex, 10);

    if (
        !Number.isInteger(mainImageIndex) ||
        mainImageIndex < 0 ||
        mainImageIndex >= images.length
    ) {
        errors.mainImageIndex = "Select a valid main image.";
    }

    if (Object.keys(errors).length > 0 || !projectFile) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            name,
            shortDescription,
            description,
            version,
            tags,
            publishDate,
            projectUpdatedAt,
            projectFile,
            images,
            mainImageIndex,
        },
    };
}

function normalizeOptionalImages(
    values: FormDataEntryValue[],
    errors: CreateProjectFieldErrors,
): File[] {
    const files = values.filter(isFileEntry).filter((file) => file.size > 0);

    if (files.length === 0) {
        return [];
    }

    if (files.length > PROJECT_LIMITS.maxImages) {
        errors.images = `You can upload up to ${PROJECT_LIMITS.maxImages} images.`;
        return [];
    }

    const invalidImage = files.find(
        (file) =>
            !ALLOWED_IMAGE_TYPES.has(file.type) ||
            file.size > PROJECT_LIMITS.maxImageSizeBytes,
    );

    if (invalidImage) {
        errors.images =
            "Images must be PNG, JPG, WEBP, or GIF and each must be under 8MB.";
        return [];
    }

    return files;
}

export function validateUpdateProjectForm(
    formData: FormData,
):
    | { success: true; data: ValidatedUpdateProjectInput }
    | { success: false; errors: CreateProjectFieldErrors } {
    const errors: CreateProjectFieldErrors = {};

    const name = sanitizePlainText(String(formData.get("name") ?? ""));
    if (
        name.length < PROJECT_LIMITS.name.min ||
        name.length > PROJECT_LIMITS.name.max
    ) {
        errors.name = `Project name must be ${PROJECT_LIMITS.name.min}-${PROJECT_LIMITS.name.max} characters.`;
    }

    const shortDescription = sanitizePlainText(
        String(formData.get("shortDescription") ?? ""),
    );
    if (
        shortDescription.length < PROJECT_LIMITS.shortDescription.min ||
        shortDescription.length > PROJECT_LIMITS.shortDescription.max
    ) {
        errors.shortDescription =
            `Short description must be between ${PROJECT_LIMITS.shortDescription.min}-${PROJECT_LIMITS.shortDescription.max} characters.`;
    }

    const description = sanitizeMarkdown(String(formData.get("description") ?? ""));
    if (
        description.length < PROJECT_LIMITS.description.min ||
        description.length > PROJECT_LIMITS.description.max
    ) {
        errors.description =
            `Description must be between ${PROJECT_LIMITS.description.min}-${PROJECT_LIMITS.description.max} characters.`;
    }

    const version = sanitizePlainText(String(formData.get("version") ?? ""));
    if (
        version.length < PROJECT_LIMITS.version.min ||
        version.length > PROJECT_LIMITS.version.max ||
        !VERSION_PATTERN.test(version)
    ) {
        errors.version =
            "Version must use letters, numbers, dots, underscores, or dashes.";
    }

    const tags = toTags(formData.get("tags"), errors);
    const projectUpdatedAt = new Date();

    const projectFileEntry = formData.get("projectFile");
    const projectFile = isFileEntry(projectFileEntry) && projectFileEntry.size > 0
        ? projectFileEntry
        : null;

    if (projectFile) {
        if (!projectFile.name.toLowerCase().endsWith(".ccproj")) {
            errors.projectFile = "Only .ccproj files are allowed.";
        }

        if (projectFile.size > PROJECT_LIMITS.maxProjectFileSizeBytes) {
            errors.projectFile =
                "Project file exceeds 40MB. Please upload a smaller file.";
        }
    }

    const images = normalizeOptionalImages(formData.getAll("images"), errors);

    const rawExistingImagesCount = String(formData.get("existingImagesCount") ?? "0").trim();
    const existingImagesCount = Number.parseInt(rawExistingImagesCount, 10);
    const safeExistingImagesCount = Number.isInteger(existingImagesCount) && existingImagesCount >= 0
        ? existingImagesCount
        : 0;

    const rawMainImageIndex = String(formData.get("mainImageIndex") ?? "0").trim();
    const mainImageIndex = Number.parseInt(rawMainImageIndex, 10);

    const imageCountForValidation = images.length > 0 ? images.length : safeExistingImagesCount;
    if (
        imageCountForValidation > 0 &&
        (!Number.isInteger(mainImageIndex) ||
            mainImageIndex < 0 ||
            mainImageIndex >= imageCountForValidation)
    ) {
        errors.mainImageIndex = "Select a valid main image.";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        data: {
            name,
            shortDescription,
            description,
            version,
            tags,
            projectUpdatedAt,
            projectFile,
            images,
            existingImagesCount: safeExistingImagesCount,
            mainImageIndex: Number.isInteger(mainImageIndex) && mainImageIndex >= 0 ? mainImageIndex : 0,
        },
    };
}