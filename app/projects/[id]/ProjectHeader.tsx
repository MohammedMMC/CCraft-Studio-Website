"use client";

import Button from "@/components/Button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { addProjectDownload, toggleProjectLike } from "./actions";
import { useTransition } from "react";

type ProjectHeaderProps = {
    projectId: string;
    projectName: string;
    projectShortDescription: string;
    ccprojFileUrl: string;
    previewImageUrl: string | null;
    isLikedByViewer: boolean;
    likesCount: number;
    downloadsCount: number;
    tags: string[];
    viewerId?: string | null;
};

export default function ProjectHeader({
    projectId,
    projectName,
    projectShortDescription,
    ccprojFileUrl,
    previewImageUrl,
    isLikedByViewer,
    likesCount,
    downloadsCount,
    tags,
    viewerId,
}: ProjectHeaderProps) {
    const pathname = usePathname();
    const [isToggleLikePending, startToggleLikeTransition] = useTransition();

    function downloadProject() {
        if (!localStorage.getItem(`downloaded_${projectId}`)) {
            addProjectDownload(projectId, pathname);
            localStorage.setItem(`downloaded_${projectId}`, "true");
        }

        window.open(ccprojFileUrl, "_blank");
    }

    return (
        <div className="flex flex-wrap gap-3">
            {previewImageUrl && (
                <Image
                    src={previewImageUrl}
                    alt={`Preview Image`}
                    width={100}
                    height={100}
                    className="h-auto rounded-xs w-56 object-cover aspect-video"
                    unoptimized
                />
            )}
            <div className="h-auto p-2 flex flex-col gap-2 max-w-[calc(100%-14rem-2rem)]">
                <h1 className="text-2xl font-bold">{projectName}</h1>
                <p className="text-sm text-neutral-900/80 line-clamp-3">{projectShortDescription}</p>
                <div className="flex flex-row gap-2 mt-auto">
                    <div className="flex flex-row gap-1 items-center mr-3">
                        <span aria-hidden="true"
                            className="size-5 bg-neutral-700 [mask:url('/icons/heart.svg')_center/contain_no-repeat]"
                        />
                        <span className="mr-2 text-xs text-neutral-700 ml-1">{likesCount}</span>
                        <span aria-hidden="true"
                            className="size-5 bg-neutral-700 [mask:url('/icons/download.svg')_center/contain_no-repeat]"
                        />
                        <span className="text-xs text-neutral-700 ml-1">{downloadsCount}</span>
                    </div>

                    {tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="cardcb border-3! shadow-[0_2px_0_0]! px-2 py-1 text-xs text-white/80"
                        >{tag}</span>
                    ))}
                </div>
            </div>
            <div className="ml-auto flex flex-row gap-2 h-16">
                <Button disabled={isToggleLikePending} className="h-full"
                    onClick={() => viewerId ? startToggleLikeTransition(() => toggleProjectLike(projectId, viewerId, pathname)) : null}
                    colors={isLikedByViewer ? `bg-red-500/80 shadow-red-600` : `bg-gray/80 shadow-gray`}
                >
                    <Image className={`select-none pointer-events-none` + (isLikedByViewer ? "" : " saturate-0")} src="/icons/heart-colored.svg" alt="Heart Icon" width={32} height={32} />
                </Button>
                <Button
                    onClick={downloadProject}
                    className="h-full" colors="text-shadow-lime bg-lime/80 shadow-lime"
                >
                    <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-lime" src="/icons/download.svg" alt="Download Icon" width={24} height={24} />
                    Download
                </Button>
            </div>
        </div>
    );
}