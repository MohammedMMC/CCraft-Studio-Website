import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import ScreenLayout from "../../components/ScreenLayout";

export default async function AuthPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <ScreenLayout>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Login</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in with your account and continue to your dashboard.
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-5 inline-flex rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
          >
            Open Sign In
          </Link>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Register</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Create an account. We sync your profile to PostgreSQL automatically.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-5 inline-flex rounded-lg bg-lime-700 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-800"
          >
            Open Sign Up
          </Link>
        </article>
      </section>
    </ScreenLayout>
  );
}