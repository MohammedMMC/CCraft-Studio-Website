import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
}

function normalizeConnectionStringSslMode(value: string) {
    try {
        const parsed = new URL(value);
        const sslMode = parsed.searchParams.get("sslmode")?.toLowerCase();

        // Keep current strong verification behavior and avoid pg/libpq compatibility warning.
        if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
            parsed.searchParams.set("sslmode", "verify-full");
        }

        return parsed.toString();
    } catch {
        return value;
    }
}

const adapter = new PrismaPg({
    connectionString: normalizeConnectionStringSslMode(connectionString),
});

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
