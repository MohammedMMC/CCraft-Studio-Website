import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";

type ScreenLayoutProps = {
  children?: ReactNode;
};

export default async function ScreenLayout({
  children,
}: ScreenLayoutProps) {
  const { userId } = await auth();

  const currentUser = userId
    ? await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    })
    : null;

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={isAdmin} />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-10 mt-auto">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 border-b border-neutral-200 pb-6 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:items-start">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left lg:items-start">
              <Image
                src="/images/icon.png"
                alt="CCraft Studio logo"
                width={56}
                height={56}
                className="shrink-0"
              />

              <div className="space-y-1">
                <p className="text-base font-semibold text-neutral-800">CCraft Studio</p>
                <p className="max-w-xl text-sm text-neutral-500">
                  Build and share better CC: Tweaked projects.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:justify-items-end">
              <div className="space-y-3 text-center sm:text-left lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Explore</p>
                <nav className="grid gap-2 text-sm text-neutral-500">
                  <Link href="/community" className="transition-colors hover:text-neutral-800">Community</Link>
                  <Link href="/dashboard" className="transition-colors hover:text-neutral-800">Dashboard</Link>
                  <Link href="/discord" className="transition-colors hover:text-neutral-800">Discord</Link>
                </nav>
              </div>

              <div className="space-y-3 text-center sm:text-left lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Legal</p>
                <nav className="grid gap-2 text-sm text-neutral-500">
                  <Link href="/pp" className="transition-colors hover:text-neutral-800">Privacy Policy</Link>
                  <Link href="/tos" className="transition-colors hover:text-neutral-800">Terms of Service</Link>
                </nav>
              </div>
            </div>
          </div>

          <p className="pt-4 text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} CCraft Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}