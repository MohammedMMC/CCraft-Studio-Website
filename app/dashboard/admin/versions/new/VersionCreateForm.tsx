"use client";

import { PROJECT_LIMITS } from "@/lib/projects/validation";
import { useActionState } from "react";
import { createVersionAction } from "./actions";
import Button from "@/components/Button";

const createVersionInitialState = {
    status: "idle" as const,
    message: "",
};

export function VersionCreateForm() {
    const [state, formAction, pending] = useActionState(createVersionAction, createVersionInitialState);

    return (
        <form action={formAction} className="space-y-6">
            <label className="block">
                <span className="text-sm font-medium">Version</span>
                <input
                    name="version"
                    type="text"
                    required
                    minLength={PROJECT_LIMITS.version.min}
                    maxLength={PROJECT_LIMITS.version.max}
                    className="mt-2 w-full px-3 py-2 text-sm focus:bg-gray/10 focus:outline-none"
                    placeholder="v1.0.0"
                    pattern="[A-Za-z0-9._-]+"
                />
            </label>

            <label className="block">
                <span className="text-sm font-medium">
                    Components Files
                </span>
                <input
                    name="componentsFiles"
                    type="file"
                    accept="application/zip"
                    required
                    className="mt-2 block w-full px-3 py-2 text-sm"
                />
            </label>

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
                    {pending ? "Creating..." : "Create Version"}
                </Button>
            </div>
        </form>
    );
}