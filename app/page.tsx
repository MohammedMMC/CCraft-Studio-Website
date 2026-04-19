
import Link from "next/link";
import ScreenLayout from "../components/ScreenLayout";
import Button from "./components/Button";

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
      <section className="p-6 w-full max-w-3xl">
        <h1 className="font-bold text-6xl my-10">Design and Build <br/> apps with ease</h1>
        <p className="text-lg">An easy-to-use studio application that helps you to quickly and easily build systems/apps for <b>CC: Tweaked</b> minecraft mod.</p>
        <Button className="w-full max-w-2xs mt-10">Download</Button>
      </section>
      
    </ScreenLayout>
  );
}
