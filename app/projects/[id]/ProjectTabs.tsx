"use client";

import { useEffect, useState, useTransition } from "react";
import ProjectDescriptionMarkdown from "../../../components/ProjectDescriptionMarkdown";
import Button from "@/components/Button";
import ImagePreviewButton from "@/app/projects/[id]/ImagePreviewButton";
import Image from "next/image";
import { deleteProject, requestProjectReview } from "./actions";
import { usePathname } from "next/navigation";
import Modal from "@/components/Modal";

type TabKey = "description" | "images" | "settings";

type ProjectTabsProps = {
    projectId: string;
    projectName: string;
    description: string;
    images: Array<{
        id: string;
        url: string;
    }>;
    reviewed: boolean;
    latestReview: {
        message: string;
        rejected: boolean;
    };
    showSettings?: boolean;
};

function getStatus(reviewed: boolean, rejected?: boolean) {
    if (!reviewed) return {
        label: "In Review",
        className: "shadow-yellow-500! bg-yellow-400/85! text-shadow-yellow-500",
    };
    if (rejected) return {
        label: "Rejected",
        className: "shadow-red-500! bg-red-400/85! text-shadow-red-500",
    };
    return {
        label: "Approved",
        className: "shadow-lime! bg-lime/85! text-shadow-lime",
    };
}

function resolveTabFromHash(hash: string, showSettings: boolean): TabKey {
    const cleanHash = hash.replace("#", "").toLowerCase();
    if (cleanHash === "images") return "images";
    if (showSettings && cleanHash === "settings") return "settings";
    return "description";
}

export default function ProjectTabs({
    projectId,
    projectName,
    description,
    images,
    reviewed,
    latestReview,
    showSettings = false,
}: ProjectTabsProps) {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<TabKey>("description");
    const [isRequestReviewPending, startRequestReviewTransition] = useTransition();
    const [isDeleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false);

    useEffect(() => {
        const syncActiveTab = () => setActiveTab(resolveTabFromHash(window.location.hash, showSettings));
        syncActiveTab();
        window.addEventListener("hashchange", syncActiveTab);
        return () => window.removeEventListener("hashchange", syncActiveTab);
    }, [showSettings]);

    const handleTabClick = (tab: TabKey) => {
        setActiveTab(tab);
        window.history.replaceState(null, "", `#${tab}`);
    };

    const tabClassName = (tab: TabKey) => `
        py-2! px-4! text-sm!
        ${activeTab === tab ? "shadow-[0_0px_0_0]! translate-y-1" : "shadow-[0_4px_0_0]"}
    `;
    const tabButtonColor = (tab: TabKey) => activeTab === tab
        ? "bg-primary/85 text-shadow-primary shadow-primary"
        : "bg-gray/85 text-shadow-gray shadow-gray";

    const statusData = getStatus(reviewed, latestReview.rejected);

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
                    ) : images.map((image, i) => (<ImagePreviewButton alt={`${projectName} Image ${i + 1}`} src={image.url} key={image.id} />))}
                </section>
            )}

            {showSettings && activeTab === "settings" && (
                <section id="settings" className="space-y-4">
                    <div className={"cardcb p-4 text-shadow-[0_2px] " + statusData.className}>
                        <h2 className="font-semibold text-white tracking-wider">Status: <span>{statusData.label}</span></h2>

                        {reviewed && latestReview.message && (
                            <p className="text-sm text-white/90 mt-2">{(latestReview.rejected ? "Reason: " : "Message: ")} <span>{latestReview.message}</span></p>
                        )}
                    </div>

                    {latestReview.rejected && reviewed && (
                        <Button className="w-full justify-center gap-4!"
                            disabled={isRequestReviewPending}
                            onClick={() => startRequestReviewTransition(() =>
                                requestProjectReview(projectId, pathname)
                            )}>
                            <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-lime" src="/icons/eye.svg" alt="Review Icon" width={24} height={24} />
                            Request Review
                        </Button>)}
                    <div className="w-full flex sm:flex-row flex-col gap-3">
                        <Button
                            onClick={() => setDeleteProjectModalOpen(true)}
                            className="w-full justify-center gap-4!"
                            colors="bg-red-400/85 text-shadow-red-400 shadow-red-400"
                        >
                            <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-red-400" src="/icons/trash.svg" alt="Delete Icon" width={24} height={24} />
                            Delete Project
                        </Button>
                        <Button
                            href={`/dashboard/projects/${projectId}/edit`}
                            className="w-full justify-center gap-4!"
                            colors="bg-blue-400/85 text-shadow-blue-400 shadow-blue-400"
                        >
                            <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-blue-400" src="/icons/pen.svg" alt="Edit Icon" width={24} height={24} />
                            Edit Project
                        </Button>
                    </div>
                </section>
            )
            }



            <Modal
                open={isDeleteProjectModalOpen}
                close={() => setDeleteProjectModalOpen(false)}
                title="Delete Project"
                description="Are you sure you want to delete this project?"
            >
                <div className="w-full flex sm:flex-row flex-col gap-3 mt-4">
                    <Button

                        onClick={() => {
                            setDeleteProjectModalOpen(false);
                            deleteProject(projectId);
                        }}
                        className="w-full justify-center gap-4!"
                        colors="bg-red-400/95 text-shadow-red-400 shadow-red-400"
                    >
                        <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-red-400" src="/icons/trash.svg" alt="Delete Icon" width={24} height={24} />
                        Confirm Delete
                    </Button>
                    <Button
                        onClick={() => setDeleteProjectModalOpen(false)}
                        className="w-full justify-center" colors="bg-gray/85 text-shadow-gray shadow-gray"
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
