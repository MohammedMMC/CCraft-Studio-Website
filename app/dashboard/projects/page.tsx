import ScreenLayout from "../../../components/ScreenLayout";

export default function DashboardProjectsPage() {
  return (
    <ScreenLayout
      title="Dashboard Projects"
      description="Starter screen for project tracking and management."
    >
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Project List</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Add your project cards, status, and filters here.
        </p>
      </section>
    </ScreenLayout>
  );
}