"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Index" },
  { href: "/community", label: "Community" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          CCraft Studio
        </Link>

        <ul className="flex flex-wrap items-center gap-2 text-sm">
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`rounded-md px-3 py-2 font-medium transition-colors ${pathname === item.href
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {!isSignedIn ? (
            <>
              <li>
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button
                    className="rounded-md border border-neutral-300 px-3 py-2 font-medium text-neutral-800 hover:bg-neutral-100"
                    type="button"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </li>
              <li>
                <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button
                    className="rounded-md bg-lime-700 px-3 py-2 font-medium text-white hover:bg-lime-800"
                    type="button"
                  >
                    Register
                  </button>
                </SignUpButton>
              </li>
            </>
          ) : (
            <li className="ml-1">
              <UserButton />
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}