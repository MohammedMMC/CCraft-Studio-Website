"use client";

import { useActionState, useState } from "react";

import {
    createProjectAction,
} from "./actions";
import { CreateProjectFieldErrors, formatBytes, PROJECT_LIMITS } from "@/lib/projects/validation";
import MDEditor from "@uiw/react-md-editor";
import Button from "@/components/Button";

const createProjectInitialState = {
    status: "idle" as const,
    message: "",
    fieldErrors: {} as CreateProjectFieldErrors,
};

function FieldError({
    errors,
    name,
}: {
    errors?: CreateProjectFieldErrors;
    name: keyof CreateProjectFieldErrors;
}) {
    const message = errors?.[name];
    if (!message) return null;

    return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function ProjectCreateForm() {
    const [state, formAction, pending] = useActionState(createProjectAction, createProjectInitialState);
    const fieldErrors = state?.fieldErrors ?? {};
    const [description, setDescription] = useState("");
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const descriptionCount = description.trim().length;
    const hasDescriptionLengthIssue =
        descriptionCount > 0 &&
        descriptionCount < PROJECT_LIMITS.description.min;

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="description" value={description} />
            <input type="hidden" name="mainImageIndex" value={String(mainImageIndex)} />

            <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-medium">Project Name</span>
                    <input
                        name="name"
                        type="text"
                        required
                        minLength={PROJECT_LIMITS.name.min}
                        maxLength={PROJECT_LIMITS.name.max}
                        className="mt-2 w-full px-3 py-2 text-sm focus:bg-gray/10 focus:outline-none"
                        placeholder="My Automation Toolkit"
                    />
                    <FieldError errors={fieldErrors} name="name" />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Version</span>
                    <input
                        name="version"
                        type="text"
                        required
                        minLength={PROJECT_LIMITS.version.min}
                        maxLength={PROJECT_LIMITS.version.max}
                        className="mt-2 w-full px-3 py-2 text-sm focus:bg-gray/10 focus:outline-none"
                        placeholder="1.0.0"
                        pattern="[A-Za-z0-9._-]+"
                    />
                    <FieldError errors={fieldErrors} name="version" />
                </label>
            </div>

            <label className="block">
                <span className="text-sm font-medium">
                    Project Short Description
                </span>
                <textarea
                    name="shortDescription"
                    required
                    minLength={PROJECT_LIMITS.shortDescription.min}
                    maxLength={PROJECT_LIMITS.shortDescription.max}
                    className="mt-2 min-h-26 w-full px-3 py-2 text-sm focus:bg-gray/10 focus:outline-none"
                    placeholder="What does this project do in one clear paragraph?"
                />
                <FieldError errors={fieldErrors} name="shortDescription" />
            </label>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        Project Description (Markdown)
                    </span>
                    <span
                        className={`text-xs ${hasDescriptionLengthIssue ? "text-red-600" : "text-neutral-500"
                            }`}
                    >
                        {descriptionCount}/{PROJECT_LIMITS.description.max}
                    </span>
                </div>
                <div data-color-mode="dark">
                    <MDEditor
                        value={description}
                        onChange={(value) => setDescription(value ?? "")}
                        preview="edit"
                        height={280}
                        textareaProps={{
                            maxLength: PROJECT_LIMITS.description.max,
                            placeholder: "Write full markdown documentation for your project.",
                        }}
                    />
                </div>
                <p className="text-xs text-neutral-500">
                    Markdown is supported.
                </p>
                <FieldError errors={fieldErrors} name="description" />
            </div>

            <label className="block">
                <span className="text-sm font-medium">Tags (comma separated)</span>
                <input
                    name="tags"
                    type="text"
                    required
                    className="mt-2 w-full px-3 py-2 text-sm focus:bg-gray/10 focus:outline-none"
                    placeholder="automation, cc-tweaked, logistics"
                    maxLength={220}
                />
                <FieldError errors={fieldErrors} name="tags" />
            </label>

            <label className="block">
                <span className="text-sm font-medium">Project File (.ccproj)</span>
                <input
                    name="projectFile"
                    type="file"
                    required
                    accept=".ccproj"
                    className="mt-2 block w-full px-3 py-2 text-sm"
                />
                <FieldError errors={fieldErrors} name="projectFile" />
            </label>

            <label className="block">
                <span className="text-sm font-medium">Project Images</span>
                <input
                    name="images"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    required
                    className="mt-2 block w-full px-3 py-2 text-sm"
                    onChange={(event) => {
                        const files = Array.from(event.currentTarget.files ?? []);
                        setSelectedImages(files);
                        setMainImageIndex(0);
                    }}
                />
                <FieldError errors={fieldErrors} name="images" />
            </label>


            {(selectedImages.length > 0) && (
                <div className="cardcb p-4">
                    <h3 className="text-sm font-semibold text-white">
                        Select Main Image For Card Preview
                    </h3>
                    <ul className="mt-3 space-y-2">
                        {selectedImages.map((file, index) => (
                            <li
                                key={`${file.name}-${file.size}-${index}`}
                                className="flex items-center justify-between gap-3 cardcb px-3 py-2"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white/90">{file.name}</p>
                                    <p className="text-xs text-white/70">{formatBytes(file.size)}</p>
                                </div>
                                <label className="inline-flex items-center gap-2 text-xs text-white/90">
                                    <input
                                        type="radio"
                                        name="main-image"
                                        checked={mainImageIndex === index}
                                        onChange={() => setMainImageIndex(index)}
                                    />
                                    Main Image
                                </label>
                            </li>
                        ))}
                    </ul>
                    <FieldError errors={fieldErrors} name="mainImageIndex" />
                </div>
            )}

            {state?.message && (
                <div
                    className={`rounded-xl border p-3 text-sm ${state.status === "success"
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    {state.message}
                </div>
            )}

            <div>
                <Button
                    type="submit"
                    disabled={pending}
                    className="cursor-pointer text-sm"
                >
                    {pending ? "Creating..." : "Create Project"}
                </Button>
            </div>
        </form>
    );
}