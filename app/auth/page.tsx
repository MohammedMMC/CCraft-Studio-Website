import ScreenLayout from "../../components/ScreenLayout";

export default function AuthPage() {
  return (
    <ScreenLayout
      title="Login / Register"
      description="Starter authentication screen with separate login and register areas."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Login</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Add your login form fields and validation here.
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Register</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Add your registration form fields and validation here.
          </p>
        </article>
      </section>
    </ScreenLayout>
  );
}