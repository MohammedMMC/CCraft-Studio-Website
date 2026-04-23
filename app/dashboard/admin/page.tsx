import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { isMissingProjectTablesError } from "@/lib/projects/db-guards";
import ScreenLayout from "../../../components/ScreenLayout";
import { formatBytes, formatDate, PROJECT_LIMITS } from "@/lib/projects/validation";
import { reviewProjectAction } from "./actions";

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
          owner: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
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
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Pending Project Reviews</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Projects remain private until approved here.
        </p>

        {pendingProjects.length === 0 ? (
          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            No unreviewed projects right now.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {pendingProjects.map((project) => {
              const ownerName = [project.owner.firstName, project.owner.lastName]
                .filter(Boolean)
                .join(" ");
              const previewImage = project.images.find((image) => image.isMain) ?? project.images[0];

              return (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
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

                  <div className="space-y-3 p-5">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900">{project.name}</h3>
                      <p className="mt-1 text-sm text-neutral-600">{project.shortDescription}</p>
                    </div>

                    <dl className="grid gap-2 text-xs text-neutral-600 md:grid-cols-2">
                      <div>
                        <dt className="font-semibold text-neutral-800">Owner</dt>
                        <dd>{ownerName || "Unnamed User"} ({project.owner.email})</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-neutral-800">Version</dt>
                        <dd>{project.version}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-neutral-800">Publish Date</dt>
                        <dd>{formatDate(project.publishDate)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-neutral-800">Updated Date</dt>
                        <dd>{formatDate(project.projectUpdatedAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-neutral-800">File</dt>
                        <dd>
                          {project.projectFileName} ({formatBytes(project.projectFileSize)})
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-neutral-800">Metrics</dt>
                        <dd>
                          {project.downloads} downloads | {project.likes} likes | {project._count.comments} comments
                        </dd>
                      </div>
                    </dl>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={project.projectFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100"
                      >
                        View .ccproj
                      </a>
                    </div>

                    <form action={reviewProjectAction} className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                      <input type="hidden" name="projectId" value={project.id} />
                      <label className="block text-xs font-semibold text-neutral-800">
                        Review Message
                        <textarea
                          name="message"
                          className="mt-1 min-h-20 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                          maxLength={PROJECT_LIMITS.reviewLog.max}
                          placeholder="Write why this project was approved or rejected."
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          name="rejected"
                          value="false"
                          className="cursor-pointer rounded-md bg-lime px-4 py-2 text-sm font-semibold text-white hover:bg-lime/85"
                        >Approve Project</button>
                        <button
                          type="submit"
                          name="rejected"
                          value="true"
                          className="cursor-pointer rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
                        >Reject Project</button>
                      </div>
                    </form>
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