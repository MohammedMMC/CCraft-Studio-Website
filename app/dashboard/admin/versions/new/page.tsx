import ScreenLayout from "@/components/ScreenLayout";
import { VersionCreateForm } from "./VersionCreateForm";

export default function NewProjectPage() {
    return (
        <ScreenLayout>
            <section className="border-4 border-neutral-200 p-6">
                <h1 className="text-xl font-semibold">Create Project</h1>
                <p className="mt-2 text-sm text-neutral-600">Upload your .ccproj file, add project details, and submit it for review.</p>

                <div className="mt-6">
                    <VersionCreateForm />
                </div>
            </section>
        </ScreenLayout>
    );
}