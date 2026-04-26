import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
    <div className="min-h-screen">
      <Navbar isAdmin={isAdmin} />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 space-y-3">
          <nav aria-label="Legal links" className="flex items-center justify-center gap-3 text-sm text-neutral-500">
            <Link href="/pp" className="transition-colors hover:text-neutral-800">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-neutral-300">|</span>
            <Link href="/tos" className="transition-colors hover:text-neutral-800">
              Terms of Service
            </Link>
          </nav>
          <p className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} CCraft Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}