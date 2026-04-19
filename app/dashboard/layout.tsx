import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncCurrentUserToDatabase } from "@/lib/auth/sync-user";

type DashboardLayoutProps = {
    children: ReactNode;
};

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/auth/sign-in");
    }

    await syncCurrentUserToDatabase();

    return <>{children}</>;
}
