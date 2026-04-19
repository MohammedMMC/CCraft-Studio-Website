import Link from "next/link";

const navLinks = [
  { href: "/", label: "Index" },
  { href: "/auth", label: "Login / Register" },
  { href: "/community", label: "Community" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/admin", label: "Admin" },
];

export default function Navbar() {
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
                className="rounded-md px-3 py-2 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}