import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import ScreenLayout from "../../../components/ScreenLayout";
import ProjectCard from "@/components/ProjectCard";
import Button from "@/components/Button";
import { formatBytes, formatDate } from "@/lib/functions";

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

  const componentsVersions = await prisma.componentsVersions.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      version: true,
      createdAt: true,
      size: true
    },
  });

  return (
    <ScreenLayout>
      <section>
        <h1 className="text-lg font-semibold">Pending Project Reviews</h1>

        {pendingProjects.length === 0 ? (
          <div className="mt-4 cardcb p-4 text-sm text-white/90">
            Couldn&apos;t find any unreviewed projects.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {pendingProjects.map((project) => {
              return (
                <ProjectCard key={project.id} project={project} view="admin" componentsVersions={componentsVersions} />
              );
            })}
          </div>
        )}
      </section>
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-shadow-gray/20 text-shadow-[0_2px]">Components Versions</h1>
          <Button
            href="/dashboard/admin/versions/new"
            className="text-sm px-4! py-2! justify-center"
          >Create Version</Button>
        </div>

        <div>
          {componentsVersions.length === 0 ? (
            <div className="mt-4 cardcb p-4 text-sm text-white/90">
              Couldn&apos;t find any components versions.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
              {componentsVersions.map((componentsVersion) => {
                return (
                  <div key={componentsVersion.version} className="cardcb p-4">
                    <h2 className="text-lg font-semibold text-white mb-2">{componentsVersion.version}</h2>
                    <p className="text-sm text-white/80">
                      Created at: {formatDate(componentsVersion.createdAt)}
                    </p>
                    <p className="text-sm text-white/80">
                      Size: {formatBytes(componentsVersion.size)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ScreenLayout>
  );
}