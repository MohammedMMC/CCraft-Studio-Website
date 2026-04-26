"use client";

import { useMemo, useState } from "react";

type TagSelectDropdownProps = {
    tags: string[];
    initialSelectedTags: string[];
};

export default function TagSelectDropdown({ tags, initialSelectedTags }: TagSelectDropdownProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

    const selectedTagsLabel = useMemo(() => {
        if (selectedTags.length === 0) return "All tags";
        if (selectedTags.length <= 2) return selectedTags.join(", ");
        return `${selectedTags.length} tags selected`;
    }, [selectedTags]);

    const toggleTag = (tag: string, checked: boolean) => {
        setSelectedTags((current) => {
            if (checked) {
                if (current.includes(tag)) return current;
                return [...current, tag];
            }
            return current.filter((item) => item !== tag);
        });
    };

    return (
        <div className="flex min-w-56 flex-col gap-1 text-xs font-semibold text-white/90">
            <span className="text-xs font-semibold">Tags</span>
            <details className="group relative">
                <summary className="cursor-pointer list-none border-4 bg-gray/90 px-3 py-2 text-sm font-medium text-white shadow-gray border-l-white/35 border-t-white/35 border-b-white/25 border-r-white/25 shadow-[0_4px_0_0] transition-all duration-150 ease-in-out active:shadow-[0_1px_0_0] active:translate-y-0.5">
                    <div className="flex items-center justify-between gap-3">
                        <span className="truncate">{selectedTagsLabel}</span>
                        <span className="text-xs text-white/70 transition group-open:rotate-180">v</span>
                    </div>
                </summary>

                <div className="absolute z-20 mt-1 max-h-64 w-72 overflow-auto border-4 bg-gray/95 p-2 text-white shadow-gray border-l-white/35 border-t-white/35 border-b-white/25 border-r-white/25 shadow-[0_4px_0_0]">
                    {tags.length === 0 ? (
                        <p className="px-2 py-2 text-xs text-white/70">No tags found.</p>
                    ) : (
                        <div className="space-y-1">
                            {tags.map((tag) => (
                                <label
                                    key={tag}
                                    className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                                >
                                    <input
                                        type="checkbox"
                                        name="tag"
                                        value={tag}
                                        checked={selectedTags.includes(tag)}
                                        onChange={(event) => toggleTag(tag, event.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <span className="truncate">{tag}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </details>
        </div>
    );
}
