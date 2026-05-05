"use client";

import { useState } from "react";
import Button from "../Button";

const faqItems = [
    {
        question: "Is CCraft Studio free to use?",
        answer: "Yes, CCraft Studio is completely free to use.",
    },
    {
        question: "Can I export only the UI?",
        answer: "Yes, you can choose to export either the UI screens or the entire project.",
    },
    {
        question: "How to use CraftOS-PC app to test my projects?",
        answer: "You should enable it from the settings. Note that CraftOS-PC should be installed on your computer.",
    },
];

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    function toggleFAQ(index: number) {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="my-24">
            <h2 className="section-title">FAQ</h2>

            <div className="mt-12 grid gap-4 grid-cols-1">
                {faqItems.map((item, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <Button
                            key={item.question}
                            className={"flex-col! items-start! text-left! h-min! " + (isActive ? "gap-2!" : "gap-0!")}
                            onClick={() => toggleFAQ(index)}
                        >
                            <p className="text-sm font-semibold tracking-wider">{item.question}</p>
                            {isActive && (<hr className="w-full" />)}
                            <p className={
                                "text-sm text-white/90 overflow-hidden transition-all duration-150 ease-in-out " +
                                (isActive ? "max-h-40" : "max-h-0")
                            }>
                                {item.answer}
                            </p>
                        </Button>
                    );
                })}
            </div>
        </section>
    );
}