
import type { Metadata } from "next";
import ScreenLayout from "../components/ScreenLayout";
import Button from "../components/Button";
import Image from "next/image";
import { LINKS } from "@/lib/links";
import { generateCanonicalUrl } from "@/lib/seo";

import PreviewSwiper from "@/components/HomePage/PreviewSwiper";
import Features from "@/components/HomePage/Features";
import FAQ from "@/components/HomePage/FAQ";

export const metadata: Metadata = {
  title: "Build ComputerCraft Apps & Tools | CCraft Studio",
  description:
    "Design and build CC: Tweaked apps faster with CCraft Studio tools, templates, and project previews.",
  alternates: {
    canonical: generateCanonicalUrl("/"),
  },
  openGraph: {
    title: "CCraft Studio",
    description:
      "Design and build CC: Tweaked apps faster with CCraft Studio tools, templates, and project previews.",
    url: generateCanonicalUrl("/"),
    images: [
      {
        url: `${generateCanonicalUrl("/")}/images/preview1.png`,
        width: 1280,
        height: 720,
        alt: "CCraft Studio app preview",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <ScreenLayout>
      {/* Main Section */}
      <section className="flex md:flex-row-reverse flex-col justify-between items-center md:gap-12 py-2">
        <Image
          className="size-[calc(200px+15vw)] max-w-96 h-auto aspect-square"
          src="/images/icon.png"
          alt="CCraft Studio Logo"
          width={1000}
          height={1000}
          priority
          sizes="(max-width: 768px) 70vw, 384px"
        />
        <div className="w-full max-w-xl">
          <h1 className="font-bold lg:text-5xl md:text-[calc(20px+1vw)] sm:text-3xl text-2xl sm:my-10 my-4">Design and Build <br /> apps with ease</h1>
          <p className="md:text-lg text-sm">An easy-to-use studio application that helps you to quickly and easily build systems/apps for <strong className="whitespace-nowrap">CC: Tweaked</strong> minecraft mod.</p>
          <Button href={LINKS.GITHUB_RELEASES} className="w-full max-w-2xs mt-12 justify-center">Download</Button>
        </div>
      </section>

      {/* Images Section */}
      <PreviewSwiper />

      {/* Overview Section */}
      <section className="my-24 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">What is CCraft Studio</p>
        <h2 className="text-2xl sm:text-3xl font-bold">A faster way to build <strong className="whitespace-nowrap">CC: Tweaked</strong> apps</h2>
        <p className="text-base md:text-lg text-neutral-700">
          <strong className="whitespace-nowrap">CCraft Studio</strong> is an open-source desktop app that helps you design <strong>ComputerCraft</strong> interfaces,
          build logic with blocks, and ship projects into <strong>Minecraft</strong> easily.
        </p>
      </section>

      {/* Features Section */}
      <Features />

      {/* FAQ Section */}
      <FAQ />

    </ScreenLayout>
  );
}
