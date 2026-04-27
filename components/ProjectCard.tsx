import { reviewProjectAction } from "@/app/dashboard/admin/actions";
import { formatBytes, formatDate, PROJECT_LIMITS } from "@/lib/projects/validation";
import { Project, ProjectComment, ProjectImage, ReviewData, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button";

type ProjectCardProps = {
    project: Project & {
        images: ProjectImage[];
        reviewLog?: ReviewData[];
        owner?: User;
        comments?: ProjectComment[];
        _count?: {
            comments: number;
        };
    };
    children?: React.ReactNode;
    colors?: string;
    view?: "user" | "owner" | "admin";
};

export default function ProjectCard({ project, view = "user" }: ProjectCardProps) {
    const previewImage = project.images.find((image) => image.isMain) ?? project.images[0];
    const latestReview = project.reviewLog?.[0];
    const ownerName = [project?.owner?.firstName, project?.owner?.lastName]
        .filter(Boolean)
        .join(" ");

    return (
        <article
            key={project.id}
            className={`
            flex flex-col
            overflow-hidden border-4 
            bg-gray/90 text-shadow-gray/20 shadow-gray 
            border-l-white/35 border-t-white/35 
            border-b-white/25 border-r-white/25 
            text-shadow-[0_2px] shadow-[0_4px_0_0]
        `}
        >
            {previewImage && (
                <Image
                    src={previewImage.url}
                    alt={`${project.name} preview`}
                    width={960}
                    height={640}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                    unoptimized
                />
            )}

            <div className="flex flex-col gap-4 justify-between p-4 h-full">
                <div className="flex flex-col gap-2">
                    <p className="font-semibold text-white line-clamp-1">{project.name}</p>
                    <p className="text-sm text-white/80 line-clamp-3">{project.shortDescription}</p>
                </div>
                {(view === "owner" || view === "user") && (
                    <div className="flex flex-col gap-3">
                        {view === "owner" && (
                            <>
                                <p className="text-xs text-white/70">
                                    Version {project.version} | Published {project.publishDate.toLocaleDateString()}
                                </p>
                                {/* <p className={`
                                    rounded-sm border px-2 py-1 text-xs
                                    ${!project.reviewed
                                        ? "border-amber-200/50 bg-amber-200/10 text-amber-300/90"
                                        : latestReview?.rejected
                                            ? "border-red-400/50 bg-red-700/10 text-red-300/90"
                                            : "border-lime/50 bg-lime/10 text-lime"}
                                `}>
                                    Status: {!project.reviewed ? "In Review" : (latestReview?.rejected ? "Rejected" : "Approved")}
                                </p> */}
                            </>
                        )}
                        <Button
                            href={`/projects/${project.id}`}
                            className="text-xs px-3! py-2! justify-center"
                        >View Project</Button>
                    </div>
                )}
                {view === "admin" && (
                    <>
                        <dl className="grid gap-2 text-xs text-neutral-600 md:grid-cols-2">
                            <div>
                                <dt className="font-semibold text-white">Owner</dt>
                                <dd className="text-white/70">{ownerName || "Unnamed User"} ({project.owner?.email})</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-white">Version</dt>
                                <dd className="text-white/70">{project.version}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-white">Publish Date</dt>
                                <dd className="text-white/70">{formatDate(project.publishDate)}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-white">Updated Date</dt>
                                <dd className="text-white/70">{formatDate(project.projectUpdatedAt)}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-white">File</dt>
                                <dd className="text-white/70">
                                    <Link
                                        download
                                        href={project.projectFileUrl}
                                        className="underline text-white/70 hover:text-white/60"
                                    >{project.projectFileName}</Link> ({formatBytes(project.projectFileSize)})
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-white">Metrics</dt>
                                <dd className="text-white/70">
                                    {project.downloads} downloads <br /> {project.likes.length} likes <br /> {project?._count?.comments} comments
                                </dd>
                            </div>
                        </dl>

                        <Button
                            href={`/projects/${project.id}`}
                            className="w-full text-xs px-3! py-2! justify-center"
                        >Open Project Page</Button>

                        <form action={reviewProjectAction} className="space-y-2">
                            <input type="hidden" name="projectId" value={project.id} />
                            <label className="block text-sm font-semibold text-white">
                                Review Message
                            </label>
                            <textarea
                                name="message"
                                className="mt-1 bg-white min-h-20 w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
                                maxLength={PROJECT_LIMITS.reviewLog.max}
                                placeholder="Write why this project was approved or rejected."
                            />
                            <div className="flex flex-row justify-between gap-2">
                                <Button
                                    type="submit"
                                    name="rejected"
                                    value="false"
                                    colors="bg-lime/95 text-shadow-lime shadow-lime"
                                    className="w-full text-xs px-3! py-2! justify-center"
                                >Approve</Button>
                                <Button
                                    type="submit"
                                    name="rejected"
                                    value="true"
                                    colors="bg-red-400/95 text-shadow-red-400 shadow-red-400"
                                    className="w-full text-xs px-3! py-2! justify-center"
                                >Reject</Button>
                            </div>
                        </form>
                    </>
                )}
            </div>

        </article>
    );
}