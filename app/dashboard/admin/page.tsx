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
      
    </ScreenLayout>
  );
}