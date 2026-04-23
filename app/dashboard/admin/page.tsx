import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import ScreenLayout from "../../../components/ScreenLayout";
import { formatBytes, formatDate, PROJECT_LIMITS } from "@/lib/projects/validation";
import { reviewProjectAction } from "./actions";
import ProjectCard from "@/components/ProjectCard";

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

  const pendingProjects = await (async () => {
    try {
      return await prisma.project.findMany({
        where: { reviewed: false },
        orderBy: { createdAt: "desc" },
        include: {
          owner: true,
          images: {
            orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });
    } catch (error) {
      if (!isMissingProjectTablesError(error)) {
        throw error;
      }

      return [];
    }
  })();

  return (
    <ScreenLayout>
      <section>
        <h2 className="text-lg font-semibold">Pending Project Reviews</h2>

        {pendingProjects.length === 0 ? (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            No unreviewed projects right now.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {pendingProjects.map((project) => {
              return (
                <ProjectCard key={project.id} project={project} view="admin" />
              );
            })}
          </div>
        )}
      </section>
    </ScreenLayout>
  );
}