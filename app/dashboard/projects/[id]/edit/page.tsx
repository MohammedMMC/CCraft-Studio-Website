import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import ScreenLayout from "@/components/ScreenLayout";
import { prisma } from "@/lib/prisma";
import ProjectCreateForm from "../../new/ProjectCreateForm";

export default async function EditProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
        redirect("/auth/sign-in");
    }

    const viewer = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
    });

    if (!viewer) {
        redirect("/auth/sign-in");
    }

    const project = await prisma.project.findFirst({
        where: {
            id,
            ownerId: viewer.id,
        },
        include: {
            images: {
                orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
                select: { id: true, url: true, isMain: true },
            },
        },
    });

    if (!project) {
        notFound();
    }

    const mainImageIndex = Math.max(
        project.images.findIndex((image) => image.isMain),
        0,
    );

    return (
        <ScreenLayout>
            <section className="cardcb p-6">
                <h1 className="text-xl font-semibold text-white">Edit Project</h1>
                <p className="mt-2 text-sm text-white/80">
                    Update your project information and save changes.
                </p>

                <div className="mt-6">
                    <ProjectCreateForm
                        mode="edit"
                        projectId={project.id}
                        initialValues={{
                            name: project.name,
                            shortDescription: project.shortDescription,
                            description: project.description,
                            version: project.version,
                            tags: project.tags,
                            projectFileName: project.projectFileName,
                            images: project.images.map((image) => ({ id: image.id, url: image.url })),
                            mainImageIndex,
                        }}
                    />
                </div>
            </section>
        </ScreenLayout>
    );
}
