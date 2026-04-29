import { auth } from "@clerk/nextjs/server";
import ScreenLayout from "../../components/ScreenLayout";
import { prisma } from "@/lib/prisma";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import ProjectCard from "@/components/ProjectCard";
import Button from "@/components/Button";
import TokenSection from "./TokenSection";

export default async function DashboardPage() {
  const { userId } = await auth();

  const user = userId ? await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  }) : null;

  const projects = user
    ? await (async () => {
      try {
        return await prisma.project.findMany({
          where: { ownerId: user.id },
          orderBy: { createdAt: "desc" },
          include: {
            images: {
              orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
            },
            reviewLog: {
              orderBy: { reviewedAt: "desc" }, take: 1,
            },
          },
        });
      } catch (error) {
        if (!isMissingProjectTablesError(error)) {
          throw error;
        }

        return [];
      }
    })()
    : [];

  return (
    <ScreenLayout>
      <section className="mb-10">
        <h1 className="text-2xl font-bold text-shadow-gray/20 text-shadow-[0_2px]">Welcome back, {user?.firstName || "User"}!</h1>
        <TokenSection />
      </section>
      {/* Projects Section */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-shadow-gray/20 text-shadow-[0_2px]">Your Projects</h1>
          <Button
            href="/dashboard/projects/new"
            className="text-sm px-4! py-2! justify-center"
          >Create Project</Button>
        </div>

        {projects.length === 0 ? (
          <div className="cardcb p-4 text-sm text-white/90">
            You have not uploaded any projects yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {projects.map((project) => {
              return (
                <ProjectCard key={project.id} project={project} view="owner" />
              );
            })}
          </div>
        )}
      </section>
    </ScreenLayout>
  );
}