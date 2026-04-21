import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import ScreenLayout from "../../components/ScreenLayout";
import { prisma } from "@/lib/prisma";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import Image from "next/image";

export default async function DashboardPage() {
  const { userId } = await auth();

  const user = userId
    ? await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
    : null;

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

      {/* Projects Section */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <Link
            href="/dashboard/projects/new"
            className="rounded-md bg-lime-700 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-800"
          >
            Create Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
            You have not uploaded any projects yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const previewImage = project.images.find((image) => image.isMain) ?? project.images[0];

              return (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                >
                  {previewImage ? (
                    <Image
                      src={previewImage.url}
                      alt={`${project.name} preview`}
                      width={960}
                      height={540}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                      unoptimized
                    />
                  ) : null}

                  <div className="space-y-2 p-4">
                    <h3 className="font-semibold text-neutral-900">{project.name}</h3>
                    <p className="text-sm text-neutral-600">{project.shortDescription}</p>
                    <p className="text-xs text-neutral-500">
                      Version {project.version} | Published {project.publishDate.toLocaleDateString()}
                    </p>
                    <p className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-700">
                      Status: {project.reviewed ? "Reviewed" : "In Review"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </ScreenLayout>
  );
}