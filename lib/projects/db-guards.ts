import { Prisma } from "@prisma/client";


const PROJECT_MODEL_NAMES = new Set(["Project", "ProjectImage", "ProjectComment"]);

export function isMissingProjectTablesError(error: unknown): boolean {
    if(!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2021") {
        return false;
    }

    return PROJECT_MODEL_NAMES.has(typeof error.meta?.modelName === "string" ? error.meta.modelName : "");
}