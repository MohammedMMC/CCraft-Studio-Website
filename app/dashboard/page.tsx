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
            reviewLog: {
              orderBy: { reviewedAt: "desc" }, take: 1,
              select: { rejected: true, },
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
          <h2 className="text-lg font-semibold text-shadow-gray/20 text-shadow-[0_2px]">Your Projects</h2>
          <Link
            href="/dashboard/projects/new"
            className="rounded-md bg-lime px-4 py-2 text-sm font-semibold text-white hover:bg-lime/85"
          >Create Project</Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
            You have not uploaded any projects yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {projects.map((project) => {
              const previewImage = project.images.find((image) => image.isMain) ?? project.images[0];
              const latestReview = project.reviewLog[0];

              return (
                <article
                  key={project.id}
                  className="overflow-hidden border-4 bg-gray/90 text-shadow-gray/20 shadow-gray border-l-white/35 border-t-white/35 border-b-white/25 border-r-white/25 text-shadow-[0_2px] shadow-[0_4px_0_0]"
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
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <p className="text-sm text-white/90">{project.shortDescription}</p>
                    <p className="text-xs text-white/70">
                      Version {project.version} | Published {project.publishDate.toLocaleDateString()}
                    </p>
                    <div className="flex flex-col gap-2">
                      <p className={`
                        rounded-sm border px-2 py-1 text-xs 
                        ${!project.reviewed
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : latestReview?.rejected
                            ? "border-rose-200 bg-rose-50 text-rose-800"
                            : "border-lime/50 bg-lime/10 text-lime"}
                      `}>
                        Status: {!project.reviewed ? "In Review" : (latestReview?.rejected ? "Rejected" : "Approved")}
                      </p>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-center cursor-pointer rounded-md bg-lime px-4 py-2 text-sm font-semibold text-white hover:bg-lime/85"
                      >View Project</Link>
                    </div>
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