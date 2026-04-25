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
import Button from "./Button";

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

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            CCraft Studio
          </Link>

          <Button
            className="cursor-pointer inline-flex h-10 w-10 items-center justify-center border-2 border-current/20 transition-colors md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span
              className={`absolute h-0.5 w-5 bg-current transition-transform duration-200 ${isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"
                }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-current transition-opacity duration-200 ${isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-current transition-transform duration-200 ${isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"
                }`}
            />
          </Button>

          <div className="hidden items-center gap-2 md:flex">
            <ul className="flex items-center gap-2">
              {visibleLinks.map((item) => (
                <li key={item.href}>
                  <Button
                    href={item.href}
                    className="px-2.5! py-1.5! mb-1! text-sm"
                    colors={
                      pathname === item.href
                        ? undefined
                        : (
                          item.label === "Admin"
                            ? "bg-purple-400/85 text-shadow-purple-400 shadow-purple-400"
                            : (
                              item.label === "Dashboard"
                                ? "bg-blue-400/85 text-shadow-blue-400 shadow-blue-400"
                                : "bg-gray/85 shadow-gray text-shadow-gray"
                            )
                        )
                    }
                  >
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>

            {!isSignedIn ? (
              <div className="flex items-center gap-2 text-sm">
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <Button
                    className="px-2.5! py-1.5! mb-1! text-sm"
                    colors={pathname === "/auth/sign-in" ? undefined : "bg-gray/85 shadow-gray text-shadow-gray"}
                    type="button"
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                  <Button
                    className="px-2.5! py-1.5! mb-1! text-sm"
                    colors={pathname === "/auth/sign-up" ? undefined : "bg-gray/85 shadow-gray text-shadow-gray"}
                    type="button"
                  >
                    Register
                  </Button>
                </SignUpButton>
              </div>
            ) : (
              <div className="h-10 w-10">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonTrigger: "w-full! h-full! rounded-xs!",
                      userButtonAvatarBox: "w-full! h-full! rounded-xs!",
                      userButtonPopoverCard: "rounded-xs!",
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div
          id="mobile-nav-menu"
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out md:hidden ${isMenuOpen ? "mt-3 max-h-112 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="cardcb p-3! py-4!">
            <ul className="flex flex-col gap-3">
              {visibleLinks.map((item) => (
                <li key={item.href}>
                  <Button
                    href={item.href}
                    className="px-2.5! py-1.5! mb-1! text-sm w-full text-center"
                    colors={
                      pathname === item.href
                        ? undefined
                        : (
                          item.label === "Admin"
                            ? "bg-purple-400/85 text-shadow-purple-400 shadow-purple-400"
                            : (
                              item.label === "Dashboard"
                                ? "bg-blue-400/85 text-shadow-blue-400 shadow-blue-400"
                                : "bg-gray/85 shadow-gray text-shadow-gray"
                            )
                        )
                    }
                  >
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>

            <div className="h-0.5 bg-white/20 my-3"></div>

            {!isSignedIn ? (
              <div className="flex flex-row gap-2">
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <Button
                    className="w-full px-2.5! py-1.5! text-sm"
                    colors={pathname === "/auth/sign-in" ? undefined : "bg-gray/85 shadow-gray text-shadow-gray"}
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                  <Button
                    className="w-full px-2.5! py-1.5! text-sm"
                    colors={pathname === "/auth/sign-up" ? undefined : "bg-gray/85 shadow-gray text-shadow-gray"}
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Button>
                </SignUpButton>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <div className="h-10 w-10">
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonTrigger: "w-full! h-full! rounded-xs!",
                        userButtonAvatarBox: "w-full! h-full! rounded-xs!",
                        userButtonPopoverCard: "rounded-xs!",
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header >
  );
}