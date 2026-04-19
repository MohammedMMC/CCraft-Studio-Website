import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import ScreenLayout from "../../components/ScreenLayout";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();

  const user = userId
    ? await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
    : null;

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <ScreenLayout>
      <section className="mb-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Account Snapshot</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Signed in as <b>{fullName || "Unnamed User"}</b> ({user?.email || "No email"})
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Role: {user?.role || "USER"}
          {" | "}
          Joined: {user ? user.createdAt.toLocaleDateString() : "N/A"}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/projects"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-100"
        >
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Open the projects dashboard page.
          </p>
        </Link>

        <Link
          href="/dashboard/admin"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-100"
        >
          <h2 className="text-lg font-semibold">Admin</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Open the admin dashboard page.
          </p>
        </Link>
      </section>
    </ScreenLayout>
  );
}