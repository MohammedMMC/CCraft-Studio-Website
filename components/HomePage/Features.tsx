"use client";

import Image from "next/image";

const featuresItems = [
    {
        title: "Responsive UI design",
        desc: "Create interfaces that work well on different screen sizes.",
        images: [
            { image: "/images/features/screen-computer-preview.png", alt: "Computer Terminal" },
            { image: "/images/features/screen-monitor-5x4-preview.png", alt: "5x4 Monitor" },
        ],
    },
    {
        title: "Build Logic using blocks",
        desc: "Program your apps using blocks instead of coding.",
        image: "/images/features/blocks-preview.png",
    },
    {
        title: "Easy To Use",
        desc: "Drag-and-drop components to the screen and style them easily from the properties tab.",
    },
    {
        title: "Custom Project Export",
        desc: "You are able to only export the UI and program the logic using Lua.",
    },
    {
        title: "Test your projects fast",
        desc: "Use built-in CraftOS-PC app, or use our api cloud upload to test your projects quickly.",
    },
];

export default function Features() {
    return (
        <section className="my-24">
            <h2 className="section-title">Features</h2>
            <div className="mt-12 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {featuresItems.map((item, index) => (
                    <div key={`feature-${index}`} className={"cardcb p-4 text-sm text-white/90 flex flex-col gap-3 " + (item.images ? "md:col-span-2" : "")}>
                        <div className="space-y-1">
                            <p className="text-lg">{item.title}</p>
                            <p className="text-sm text-white/70">{item.desc}</p>
                        </div>
                        {(item.image || item.images) && (<hr />)}
                        {item.images && (
                            <div className="flex gap-2 mt-auto">
                                {item.images.map((img, imgIndex) => (
                                    <div
                                        key={`feature-image-${imgIndex}`}
                                        className="w-full h-auto"
                                    >
                                        <Image
                                            className="aspect-video w-full h-auto"
                                            src={img.image}
                                            alt={`${item.title} - ${img.alt} preview`}
                                            width={320}
                                            height={320}
                                            loading="lazy"
                                        />
                                        <p className="text-xs text-white/50 text-center mt-1">{img.alt}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {item.image && (
                            <Image
                                className="w-full h-full aspect-video mt-auto"
                                src={item.image}
                                alt={`${item.title} preview`}
                                height={320}
                                width={320}
                                loading="lazy"
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}