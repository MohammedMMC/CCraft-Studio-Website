import ScreenLayout from "../../../components/ScreenLayout";

export default function DashboardAdminPage() {
  return (
    <ScreenLayout
      title="Dashboard Admin"
      description="Starter admin screen for permissions and platform settings."
    >
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Admin Controls</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Add user management, role controls, and system settings here.
        </p>
      </section>
    </ScreenLayout>
  );
}