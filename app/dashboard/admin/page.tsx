import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ScreenLayout from "../../../components/ScreenLayout";

export default async function DashboardAdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <ScreenLayout>
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Admin Controls</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Add user management, role controls, and system settings here.
        </p>
      </section>
    </ScreenLayout>
  );
}