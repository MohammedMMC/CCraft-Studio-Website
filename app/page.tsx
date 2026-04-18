
import Link from "next/link";
import ScreenLayout from "../components/ScreenLayout";

const quickLinks = [
  { href: "/auth", label: "Login / Register" },
  { href: "/community", label: "Community" },
  { href: "/dashboard", label: "Dashboard Main" },
  { href: "/dashboard/projects", label: "Dashboard Projects" },
  { href: "/dashboard/admin", label: "Dashboard Admin" },
];

export default function HomePage() {
  return (
    <ScreenLayout>
      <section className="p-6 max-w-2/3">
        <h1 className="font-bold text-6xl my-8">Design and Build <br/> apps with ease</h1>
        <p className="text-lg">An easy-to-use studio application that helps you to quickly and easily build systems/apps for <b>CC: Tweaked</b> minecraft mod.</p>
        <button className="mt-14 text-white font-bold text-lg py-3 px-5 bg-primary rounded-2xl">
          Download
        </button>
      </section>
      
    </ScreenLayout>
  );
}
