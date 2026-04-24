import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import ScreenLayout from "../../../components/ScreenLayout";
import { prisma } from "../../../lib/prisma";
import { isMissingProjectTablesError } from "../../../lib/projects/db-guards";
import { formatDate } from "../../../lib/projects/validation";
import Button from "@/components/Button";
import ProjectTabs from "./ProjectTabs";

export default async function ProjectDetailsPage({
    params,
}: { params: Promise<{ id: string; }>; }) {
    const { id } = await params;
    if (!id?.trim()) notFound();

    const project = await (async () => {
        try {
            return await prisma.project.findUnique({
                where: { id },
                include: {
                    owner: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            imageUrl: true,
                            role: true,
                        },
                    },
                    images: { orderBy: [{ isMain: "desc" }, { createdAt: "asc" }], },
                    reviewLog: {
                        orderBy: { reviewedAt: "desc" }, take: 1,
                    },
                    _count: { select: { comments: true, }, },
                },
            });
        } catch (error) {
            if (!isMissingProjectTablesError(error)) {
                throw error;
            }
            return null;
        }
    })();

    if (!project) notFound();

    const { userId } = await auth();
    if (!project.reviewed && !userId) redirect("/auth/sign-in");
    const viewer = userId ? await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true, },
    }) : null;

    const viewerHasAccess = viewer?.role === "ADMIN" || viewer?.id === project.ownerId;

    if (project.reviewLog[project.reviewLog.length - 1]?.rejected && !viewerHasAccess) notFound();

    const previewImage = project.images.find((image) => image.isMain) ?? project.images[0] ?? null;
    const latestReview = project.reviewLog[0];
    const ownerName = [project.owner?.firstName, project.owner?.lastName].filter(Boolean).join(" ");
    return (
        <ScreenLayout>
            <section className="space-y-6">
                <div className="flex flex-wrap gap-3">
                    {previewImage && (
                        <Image
                            src={previewImage.url}
                            alt={`${project.name} preview`}
                            width={100}
                            height={100}
                            className="h-auto rounded-xs w-56 object-cover aspect-video"
                            unoptimized
                        />
                    )}
                    <div className="h-auto p-2 flex flex-col gap-2 max-w-[calc(100%-14rem-2rem)]">
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-sm text-neutral-900/80 line-clamp-3">{project.shortDescription}</p>
                        <div className="flex flex-row gap-2 mt-auto">
                            <div className="flex flex-row gap-1 items-center mr-3">
                                <span aria-hidden="true"
                                    className="size-5 bg-neutral-700 [mask:url('/icons/heart.svg')_center/contain_no-repeat]"
                                />
                                <span className="mr-2 text-xs text-neutral-700 ml-1">{project.likes}</span>
                                <span aria-hidden="true"
                                    className="size-5 bg-neutral-700 [mask:url('/icons/download.svg')_center/contain_no-repeat]"
                                />
                                <span className="text-xs text-neutral-700 ml-1">{project.downloads}</span>
                            </div>

                            {project.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="cardcb border-3! shadow-[0_2px_0_0]! px-2 py-1 text-xs text-white/80"
                                >{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="ml-auto flex flex-row gap-2 h-16">
                        <Button className="h-full" colors={false ? `bg-red-500/80 shadow-red-900` : `bg-gray/80 shadow-gray`}>
                            <Image className={`select-none pointer-events-none` + (false ? "" : " saturate-0")} src="/icons/heart-colored.svg" alt="Heart Icon" width={32} height={32} />
                        </Button>
                        <Button className="h-full" colors="text-shadow-lime bg-lime/80 shadow-lime">
                            <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-lime" src="/icons/download.svg" alt="Download Icon" width={24} height={24} />
                            Download
                        </Button>
                    </div>
                </div>

                <div className="h-1 bg-gray/50"></div>

                <div className="grid gap-6 md:grid-cols-[1.8fr_1fr] grid-cols-1">
                    <ProjectTabs
                        projectId={project.id}
                        latestReview={latestReview}
                        reviewed={project.reviewed}
                        description={project.description}
                        images={project.images.map((image) => ({ id: image.id, url: image.url }))}
                        showSettings={viewerHasAccess}
                    />

                    <aside className="space-y-4">
                        <div className="space-y-2 cardcb p-4">
                            <h1 className="font-semibold text-white mb-4 tracking-wider">Details</h1>
                            <div className="flex flex-row items-center gap-2">
                                <Image className="select-none pointer-events-none" src="/icons/plant.svg" alt="Plant Icon" width={16} height={16} />
                                <span className="text-white/80">Version <span className="text-white/90">{project.version}</span></span>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <Image className="select-none pointer-events-none" src="/icons/clock.svg" alt="Clock Icon" width={16} height={16} />
                                <span className="text-white/80">Published <span className="text-white/90">{formatDate(project.publishDate)}</span></span>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <Image className="select-none pointer-events-none" src="/icons/clock.svg" alt="Clock Icon" width={16} height={16} />
                                <span className="text-white/80">Updated <span className="text-white/90">{formatDate(project.projectUpdatedAt)}</span></span>
                            </div>
                        </div>
                        <div className="space-y-2 cardcb p-4">
                            <h1 className="font-semibold text-white mb-4 tracking-wider">Tags</h1>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="cardcb border-3! shadow-[0_2px_0_0]! px-2 py-1 text-xs text-white/80"
                                    >{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2 cardcb p-4">
                            <h1 className="font-semibold text-white mb-4 tracking-wider">Creator</h1>
                            <div className="flex flex-row items-center gap-3">
                                <Image className="rounded-xs" src={project.owner?.imageUrl || "/images/icon.png"} loading="lazy" alt="User Image" width={64} height={64} />
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/90 font-semibold">{ownerName || "Unnamed User"}</span>
                                    <span className="text-sm text-white/75">{project.owner?.role == "ADMIN" ? "Administrator" : "Member"}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </ScreenLayout>
    );
}