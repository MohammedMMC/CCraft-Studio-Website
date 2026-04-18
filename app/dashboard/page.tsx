import Link from "next/link";
import ScreenLayout from "../../components/ScreenLayout";

export default function DashboardPage() {
  return (
    <ScreenLayout
      title="Dashboard Main"
      description="Starter dashboard home with quick links to core sections."
    >
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/projects"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-100"
        >
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Open the projects dashboard page.
          </p>
        </Link>

        <Link
          href="/dashboard/admin"
          className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-100"
        >
          <h2 className="text-lg font-semibold">Admin</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Open the admin dashboard page.
          </p>
        </Link>
      </section>
    </ScreenLayout>
  );
}