"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const navLinks = [
  { href: "/community", label: "Community" },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true },
  { href: "/dashboard/admin", label: "Admin", requiresAuth: true, requiresAdmin: true },
];

type NavbarProps = {
  isAdmin?: boolean;
};

export default function Navbar({ isAdmin = false }: NavbarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const visibleLinks = useMemo(
    () =>
      navLinks.filter(
        (item) =>
          !(
            (item.requiresAuth && !isSignedIn) ||
            (item.requiresAdmin && !isAdmin)
          ),
      ),
    [isAdmin, isSignedIn],
  );

  const getLinkClass = (href: string, stacked = false) =>
    `rounded-md px-3 py-2 font-medium transition-colors ${stacked ? "block w-full" : ""} ${
      pathname === href
        ? "bg-neutral-900 text-white"
        : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
    }`;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            CCraft Studio
          </Link>

          <button
            className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-sm border-2 border-current/20 transition-colors md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span
              className={`absolute h-0.5 w-5 rounded bg-current transition-transform duration-200 ${
                isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded bg-current transition-opacity duration-200 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded bg-current transition-transform duration-200 ${
                isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <ul className="flex items-center gap-2 text-sm">
              {visibleLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={getLinkClass(item.href)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {!isSignedIn ? (
              <div className="flex items-center gap-2 text-sm">
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button
                    className="cursor-pointer rounded-md border border-neutral-300 px-3 py-2 font-medium text-neutral-800 hover:bg-neutral-100"
                    type="button"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button
                    className="cursor-pointer rounded-md bg-lime-700 px-3 py-2 font-medium text-white hover:bg-lime-800"
                    type="button"
                  >
                    Register
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="ml-1">
                <UserButton />
              </div>
            )}
          </div>
        </div>

        <div
          id="mobile-nav-menu"
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out md:hidden ${
            isMenuOpen ? "mt-3 max-h-112 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-lg shadow-neutral-900/5 backdrop-blur">
            <ul className="flex flex-col gap-1 text-sm">
              {visibleLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={getLinkClass(item.href, true)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="my-3 h-px bg-neutral-200" />

            {!isSignedIn ? (
              <div className="grid grid-cols-1 gap-2">
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button
                    className="w-full cursor-pointer rounded-md border border-neutral-300 px-3 py-2 font-medium text-neutral-800 hover:bg-neutral-100"
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button
                    className="w-full cursor-pointer rounded-md bg-lime-700 px-3 py-2 font-medium text-white hover:bg-lime-800"
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <UserButton />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}