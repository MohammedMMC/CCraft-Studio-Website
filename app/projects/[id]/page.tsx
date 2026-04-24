import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ScreenLayout from "../../../components/ScreenLayout";
import ProjectDescriptionMarkdown from "../../../components/ProjectDescriptionMarkdown";
import { prisma } from "../../../lib/prisma";
import { isMissingProjectTablesError } from "../../../lib/projects/db-guards";
import { formatBytes, formatDate } from "../../../lib/projects/validation";
import Button from "@/components/Button";

function getStatus(reviewed: boolean, rejected?: boolean) {
    if (!reviewed) return {
        label: "In Review",
        className: "border-amber-200/50 bg-amber-200/10 text-amber-300/90",
    };
    if (rejected) return {
        label: "Rejected",
        className: "border-red-400/50 bg-red-700/10 text-red-300/90",
    };
    return {
        label: "Approved",
        className: "border-lime/50 bg-lime/10 text-lime",
    };
}

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
                        include: {
                            reviewedBy: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    imageUrl: true,
                                },
                            },
                        },
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

    if (!project.reviewed) {
        const { userId } = await auth();
        if (!userId) redirect("/auth/sign-in");

        const viewer = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true, },
        });
        if (viewer?.role !== "ADMIN" && viewer?.id !== project.ownerId) notFound();
    }

    const previewImage = project.images.find((image) => image.isMain) ?? project.images[0] ?? null;
    const latestReview = project.reviewLog[0];
    const status = getStatus(project.reviewed, latestReview?.rejected);
    const ownerName = [project.owner?.firstName, project.owner?.lastName].filter(Boolean).join(" ");
    const reviewerName = [latestReview?.reviewedBy?.firstName, latestReview?.reviewedBy?.lastName].filter(Boolean).join(" ");

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
                            className="h-auto w-56 object-cover aspect-video"
                            unoptimized
                        />
                    )}
                    <div className="h-auto p-2 flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-sm text-neutral-900/80 line-clamp-2">{project.shortDescription}</p>
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

                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="cardcb border-3! shadow-[0_2px_0_0]! px-2 py-1 text-xs text-white/80"
                                >
                                    {tag}
                                </span>
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
                {/* Line */}
                <div className="h-1 bg-gray/50"></div>

                <div className="grid gap-6 md:grid-cols-[1.8fr_1fr] grid-cols-1">
                    <div className="w-full">
                        <div className="flex flex-row gap-3">
                            <Button className="px-4! py-2! text-sm! h-min!">Description</Button>
                            <Button className="px-4! py-2! text-sm! h-min!">Images</Button>
                            <Button className="px-4! py-2! text-sm! h-min!" colors="bg-blue-400/85 text-shadow-blue-400 shadow-blue-400">Settings</Button>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="space-y-2 cardcb p-4">
                            <h1 className="font-semibold text-white mb-4! tracking-wider">Details</h1>
                            <div className="flex flex-row items-center gap-2">
                                <Image className="select-none pointer-events-none" src="/icons/plant.svg" alt="Plant Icon" width={16} height={16} />
                                <span className="text-white/80">Version <span className="text-white/90">{project.version}</span></span>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <Image className="select-none pointer-events-none" src="/icons/clock.svg" alt="Clock Icon" width={16} height={16} />
                                <span className="text-white/80">Published <span className="text-white/90">{formatDate(project.publishDate, true)}</span></span>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <Image className="select-none pointer-events-none" src="/icons/clock.svg" alt="Clock Icon" width={16} height={16} />
                                <span className="text-white/80">Updated <span className="text-white/90">{formatDate(project.projectUpdatedAt, true)}</span></span>
                            </div>
                        </div>
                        <div className="space-y-2 cardcb p-4">
                            <h1 className="font-semibold text-white mb-4! tracking-wider">Tags</h1>
                            <div className="flex flex-row gap-2 flex-wrap">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="cardcb border-3! shadow-[0_2px_0_0]! px-2 py-1 text-xs text-white/80"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2 cardcb p-4">
                            <h1 className="font-semibold text-white mb-4! tracking-wider">Creator</h1>
                            <div className="flex flex-row items-center gap-3">
                                <Image className="rounded-sm" src={project.owner?.imageUrl || ""} loading="lazy" alt="User Image" width={64} height={64} />
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/80 font-semibold">{ownerName || "Unnamed User"}</span>
                                    <span className="text-sm text-white/60">{project.owner?.role == "ADMIN" ? "Administrator" : "Member"}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    <article className="overflow-hidden rounded-sm border-4 border-l-white/35 border-t-white/35 border-b-white/25 border-r-white/25 bg-gray/90 text-white shadow-[0_4px_0_0] shadow-gray">
                        {previewImage ? (
                            <Image
                                src={previewImage.url}
                                alt={`${project.name} preview`}
                                width={1400}
                                height={820}
                                className="h-auto w-full object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="flex aspect-video items-center justify-center bg-gray/80 px-4 text-center text-sm text-white/80">
                                No preview image was uploaded for this project.
                            </div>
                        )}

                        {project.images.length > 1 ? (
                            <div className="grid gap-2 border-t border-white/20 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                {project.images.slice(0, 6).map((image) => (
                                    <Image
                                        key={image.id}
                                        src={image.url}
                                        alt={`${project.name} image`}
                                        width={640}
                                        height={360}
                                        className="aspect-video h-auto w-full rounded-sm object-cover"
                                        loading="lazy"
                                        unoptimized
                                    />
                                ))}
                            </div>
                        ) : null}
                    </article>

                    <aside className="space-y-4 cardcb p-4">
                        <h2 className="font-semibold text-white">Details</h2>

                        <dl className="space-y-3 text-sm text-neutral-700">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Owner
                                </dt>
                                <dd>
                                    {ownerName || "Unnamed User"}
                                    {project.owner?.email ? ` (${project.owner.email})` : ""}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Version
                                </dt>
                                <dd>{project.version}</dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Published
                                </dt>
                                <dd>{formatDate(project.publishDate)}</dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Last Updated
                                </dt>
                                <dd>{formatDate(project.projectUpdatedAt)}</dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Metrics
                                </dt>
                                <dd>
                                    {project.downloads} downloads | {project.likes} likes | {project._count.comments} comments
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    Tags
                                </dt>
                                <dd className="flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-sm border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                        </dl>

                        <div className="space-y-2 border-t border-neutral-200 pt-3 text-sm">
                            <p className="font-semibold text-neutral-900">Download Package</p>
                            <Link
                                href={project.projectFileUrl}
                                download
                                className="inline-flex rounded-sm bg-lime px-3 py-2 font-semibold text-white hover:bg-lime/85"
                            >
                                {project.projectFileName} ({formatBytes(project.projectFileSize)})
                            </Link>
                        </div>
                    </aside>
                </div>

                <article className="space-y-3 rounded-sm border border-neutral-200 bg-white p-4">
                    <h2 className="text-sm font-semibold text-neutral-900">Description</h2>
                    <div className="prose prose-sm max-w-none text-neutral-700">
                        <ProjectDescriptionMarkdown content={project.description} />
                    </div>
                </article>

                {latestReview ? (
                    <article className="space-y-3 rounded-sm border border-neutral-200 bg-white p-4">
                        <h2 className="text-sm font-semibold text-neutral-900">Latest Review</h2>
                        <p className="text-sm text-neutral-700">
                            <span className="font-semibold">Reviewed on:</span> {formatDate(latestReview.reviewedAt)}
                            {reviewerName ? ` by ${reviewerName}` : ""}
                        </p>
                        <p className="text-sm text-neutral-700">{latestReview.message}</p>
                    </article>
                ) : null}

                <div className="flex items-center gap-3">
                    <Link
                        href="/community"
                        className="rounded-sm border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                    >
                        Back to Community
                    </Link>
                    <Link
                        href="/dashboard"
                        className="rounded-sm border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </section>
        </ScreenLayout>
    );
}