"use client";

import { useEffect, useState } from "react";
import ProjectDescriptionMarkdown from "../../../components/ProjectDescriptionMarkdown";
import Button from "@/components/Button";
import ImagePreviewButton from "@/app/projects/[id]/ImagePreviewButton";
import Image from "next/image";

type TabKey = "description" | "images" | "settings";

type ProjectTabsProps = {
    description: string;
    images: Array<{
        id: string;
        url: string;
    }>;
    statusLabel: string;
    statusClassName: string;
    latestReviewMessage?: string;
    showSettings?: boolean;
};

function resolveTabFromHash(hash: string, showSettings: boolean): TabKey {
    const cleanHash = hash.replace("#", "").toLowerCase();
    if (cleanHash === "images") return "images";
    if (showSettings && cleanHash === "settings") return "settings";
    return "description";
}

export default function ProjectTabs({
    description,
    images,
    statusLabel,
    statusClassName,
    latestReviewMessage,
    showSettings = false,
}: ProjectTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("description");

    useEffect(() => {
        const syncActiveTab = () => setActiveTab(resolveTabFromHash(window.location.hash, showSettings));
        syncActiveTab();
        window.addEventListener("hashchange", syncActiveTab);
        return () => window.removeEventListener("hashchange", syncActiveTab);
    }, []);

    const handleTabClick = (tab: TabKey) => {
        setActiveTab(tab);
        window.history.replaceState(null, "", `#${tab}`);
    };

    const tabClassName = (tab: TabKey) => `
        py-2! px-4! text-sm!
        ${activeTab === tab ? "shadow-[0_0px_0_0]! translate-y-1" : "shadow-[0_4px_0_0]!"}
    `;
    const tabButtonColor = (tab: TabKey) => activeTab === tab
        ? "bg-primary/85 text-shadow-primary shadow-primary"
        : "bg-gray/85 text-shadow-gray shadow-gray";



    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                <Button
                    type="button"
                    className={tabClassName("description")}
                    colors={tabButtonColor("description")}
                    aria-pressed={activeTab === "description"}
                    onClick={() => handleTabClick("description")}
                >Description</Button>
                <Button
                    type="button"
                    className={tabClassName("images")}
                    colors={tabButtonColor("images")}
                    aria-pressed={activeTab === "images"}
                    onClick={() => handleTabClick("images")}
                >Images</Button>
                {showSettings && (
                    <Button
                        type="button"
                        className={tabClassName("settings")}
                        colors="bg-blue-400/85 text-shadow-blue-400 shadow-blue-400"
                        aria-pressed={activeTab === "settings"}
                        onClick={() => handleTabClick("settings")}
                    >Settings</Button>
                )}
            </div>

            {activeTab === "description" && (
                <section id="description" className="cardcb p-4">
                    <div className="text-white">
                        <ProjectDescriptionMarkdown content={description} />
                    </div>
                </section>
            )}

            {activeTab === "images" && (
                <section id="images" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {images.length === 0 ? (
                        <p className="text-sm cardcb px-4 py-2 text-white/80 col-span-full">No images uploaded for this project.</p>
                    ) : images.map((image) => (<ImagePreviewButton src={image.url} key={image.id} />))}
                </section>
            )}

            {showSettings && activeTab === "settings" && (
                <section id="settings" className="space-y-4">
                    <div className="cardcb p-4">
                        <h1 className="font-semibold text-white mb-4 tracking-wider">Reviews</h1>

                        <div className="space-y-3 rounded-sm bg-white p-4 text-sm text-neutral-700">
                            <p className={`inline-block rounded-sm border px-2 py-1 text-xs ${statusClassName}`}>
                                Status: {statusLabel}
                            </p>
                            <p>
                                {latestReviewMessage
                                    ? `Latest review message: ${latestReviewMessage}`
                                    : "No review message yet."}
                            </p>
                        </div>
                    </div>

                    <div className="w-full flex sm:flex-row flex-col gap-3">
                        <Button className="w-full justify-center gap-4!" colors="bg-red-400 text-shadow-red-400 shadow-red-400/85">
                            <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-red-400" src="/icons/trash.svg" alt="Delete Icon" width={24} height={24} />
                            Delete Project
                        </Button>
                        <Button className="w-full justify-center gap-4!" colors="bg-blue-400 text-shadow-blue-400 shadow-blue-400/85">
                            <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-blue-400" src="/icons/pen.svg" alt="Edit Icon" width={24} height={24} />
                            Edit Project
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
}
