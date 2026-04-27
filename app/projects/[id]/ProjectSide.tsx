"use client";

import { UserRole } from "@prisma/client";
import Image from "next/image";

type ProjectSideProps = {
    projectId: string;
    version: string;
    tags: string[];
    publishDate: string;
    projectUpdatedAt: string;
    creator: {
        name: string;
        imageUrl: string | null;
        role: UserRole;
    }
};

export default function ProjectSide({
    projectId,
    version,
    tags,
    publishDate,
    projectUpdatedAt,
    creator,
}: ProjectSideProps) {
    return (
        <aside className="space-y-4">
            <div className="space-y-2 cardcb p-4">
                <h2 className="font-semibold text-white mb-4 tracking-wider">Details</h2>
                <div className="flex flex-row items-center gap-2">
                    <Image className="select-none pointer-events-none" src="/icons/plant.svg" alt="Plant Icon" width={16} height={16} />
                    <span className="text-white/80">Version <span className="text-white/90">{version}</span></span>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Image className="select-none pointer-events-none" src="/icons/clock.svg" alt="Clock Icon" width={16} height={16} />
                    <span className="text-white/80">Published <span className="text-white/90">{publishDate}</span></span>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Image className="select-none pointer-events-none" src="/icons/clock.svg" alt="Clock Icon" width={16} height={16} />
                    <span className="text-white/80">Updated <span className="text-white/90">{projectUpdatedAt}</span></span>
                </div>
            </div>
            <div className="space-y-2 cardcb p-4">
                <h2 className="font-semibold text-white mb-4 tracking-wider">Tags</h2>
                <div className="flex flex-row gap-2 flex-wrap">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="cardcb border-3! shadow-[0_2px_0_0]! px-2 py-1 text-xs text-white/80"
                        >{tag}</span>
                    ))}
                </div>
            </div>
            <div className="space-y-2 cardcb p-4">
                <h2 className="font-semibold text-white mb-4 tracking-wider">Creator</h2>
                <div className="flex flex-row items-center gap-3">
                    <Image className="rounded-xs" src={creator.imageUrl || "/images/icon.png"} loading="lazy" alt="User Image" width={64} height={64} />
                    <div className="flex flex-col gap-1">
                        <span className="text-white/90 font-semibold">{creator.name || "Unnamed User"}</span>
                        <span className="text-sm text-white/75">{creator.role == "ADMIN" ? "Administrator" : "Member"}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}