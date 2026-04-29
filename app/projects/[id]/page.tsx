import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import ScreenLayout from "../../../components/ScreenLayout";
import { prisma } from "../../../lib/prisma";
import { isMissingProjectTablesError } from "../../../lib/projects/db-guards";
import ProjectTabs from "./ProjectTabs";
import ProjectSide from "./ProjectSide";
import ProjectHeader from "./ProjectHeader";
import { getSiteUrl } from "@/lib/site-url";
import { metadata } from "@/app/layout";
import { formatDate } from "@/lib/functions";

async function getProjectMetadata(id: string) {
    try {
        return await prisma.project.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                shortDescription: true,
                reviewed: true,
                tags: true,
                images: {
                    orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
                    select: { url: true },
                },
            },
        });
    } catch (error) {
        if (!isMissingProjectTablesError(error)) {
            throw error;
        }

        return null;
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    if (!id?.trim()) {
        return {};
    }

    const project = await getProjectMetadata(id);
    if (!project) {
        return {};
    }

    const siteUrl = getSiteUrl();
    const previewImage = project.images[0]?.url ?? `${siteUrl}/images/icon.png`;

    return {
        title: project.name,
        description: project.shortDescription,
        alternates: {
            canonical: `/projects/${project.id}`,
        },
        openGraph: {
            type: "article",
            siteName: "CCraft Studio",
            title: project.name,
            description: project.shortDescription,
            url: `/projects/${project.id}`,
            images: [previewImage],
        },
        keywords: metadata.keywords?.concat(...project.tags) || [],
        robots: project.reviewed
            ? {
                index: true,
                follow: true,
            }
            : {
                index: false,
                follow: false,
            },
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

    const latestReview = project.reviewLog[project.reviewLog.length - 1];

    if (latestReview?.rejected && !viewerHasAccess) notFound();

    const previewImage = project.images.find((image) => image.isMain) ?? project.images[0] ?? null;

    return (
        <ScreenLayout>
            <section className="space-y-6">
                <ProjectHeader
                    projectId={project.id}
                    projectName={project.name}
                    projectShortDescription={project.shortDescription}
                    ccprojFileUrl={project.projectFileUrl}
                    previewImageUrl={previewImage?.url ?? null}
                    isLikedByViewer={project.likes.includes(viewer?.id ?? "")}
                    likesCount={project.likes.length}
                    downloadsCount={project.downloads}
                    tags={project.tags}
                    viewerId={viewer?.id}
                />

                <div className="h-1 bg-gray/50"></div>

                <div className="grid gap-6 md:grid-cols-[1.8fr_1fr] grid-cols-1">
                    <ProjectTabs
                        projectId={project.id}
                        latestReview={{
                            message: latestReview?.message ?? "",
                            rejected: latestReview?.rejected ?? false
                        }}
                        reviewed={project.reviewed}
                        description={project.description}
                        images={project.images.map((image) => ({ id: image.id, url: image.url }))}
                        showSettings={viewerHasAccess}
                    />

                    <ProjectSide
                        projectId={project.id}
                        version={project.version}
                        tags={project.tags}
                        publishDate={formatDate(project.publishDate, true)}
                        projectUpdatedAt={formatDate(project.projectUpdatedAt, true)}
                        creator={{
                            name: [project.owner?.firstName, project.owner?.lastName].filter(Boolean).join(" "),
                            imageUrl: project.owner.imageUrl,
                            role: project.owner.role
                        }}
                    />
                </div>
            </section>
        </ScreenLayout>
    );
}