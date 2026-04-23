import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import ScreenLayout from "../../../components/ScreenLayout";
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

  const latestReviewedProjects = await (async () => {
    try {
      const reviewedProjects = await prisma.project.findMany({
        where: { reviewed: true, reviewLog: { some: {} } },
        include: {
          owner: true,
          images: {
            orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
          },
          reviewLog: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
          },
        },
      });

      return reviewedProjects
        .sort((a, b) => {
          const aReviewedAt = a.reviewLog[0]?.reviewedAt?.getTime() ?? 0;
          const bReviewedAt = b.reviewLog[0]?.reviewedAt?.getTime() ?? 0;
          return bReviewedAt - aReviewedAt;
        })
        .slice(0, 6);
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
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Couldn&apos;t find any unreviewed projects.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {pendingProjects.map((project) => {
              return (
                <ProjectCard key={project.id} project={project} view="admin" />
              );
            })}
          </div>
        )}
      </section>
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Latest Project Reviews</h2>

        {latestReviewedProjects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Couldn&apos;t find any reviewed projects.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {latestReviewedProjects.map((project) => {
              return (
                <ProjectCard key={project.id} project={project} view="user" />
              );
            })}
          </div>
        )}
      </section>
    </ScreenLayout>
  );
}