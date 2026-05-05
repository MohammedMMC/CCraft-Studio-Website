
import type { Metadata } from "next";
import ScreenLayout from "../components/ScreenLayout";
import Button from "../components/Button";
import Image from "next/image";
import PreviewSwiper from "@/components/PreviewSwiper";
import { LINKS } from "@/lib/links";
import { generateCanonicalUrl } from "@/lib/seo";

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

const featuresItems = [
  {
    title: "Responsive UI design",
    desc: "Create interfaces that work well on different screen sizes.",
    images: [
      { image: "/images/features/screen-computer-preview.png", alt: "Computer Terminal" },
      { image: "/images/features/screen-monitor-5x4-preview.png", alt: "5x4 Monitor" },
    ],
  },
  {
    title: "Export the project",
    desc: "Export your project with the config you like.",
    image: "/images/features/project-export-preview.png",
  },
  {
    title: "Build Logic using blocks",
    desc: "Program your apps using blocks instead of coding.",
    image: "/images/features/blocks-preview.png",
  },
  {
    title: "Test your projects fast",
    desc: "Use CraftOS-PC to test your projects quickly.",
    image: "/images/features/craftospc-preview.png",
  },
];

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
      <section className="my-24">
        <h2 className="section-title">Features</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {featuresItems.map((item, index) => (
            <div key={`feature-${index}`} className={"cardcb p-4 text-sm text-white/90 flex flex-col gap-3 " + (item.images ? "col-span-2" : "")}>
              <div className="space-y-1">
                <p className="text-lg">{item.title}</p>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
              <hr />
              {item.images && (
                <div className="flex gap-2 mt-auto">
                  {item.images.map((img, imgIndex) => (
                    <div
                      key={`feature-image-${imgIndex}`}
                      className="w-full h-auto"
                    >
                      <Image
                        className="aspect-video w-full h-auto"
                        src={img.image}
                        alt={`${item.title} - ${img.alt} preview`}
                        width={320}
                        height={320}
                      />
                      <p className="text-xs text-white/50 text-center mt-1">{img.alt}</p>
                    </div>
                  ))}
                </div>
              )}
              {item.image && (
                <Image
                  className="w-full h-full aspect-video mt-auto"
                  src={item.image}
                  alt={`${item.title} preview`}
                  height={320}
                  width={320}
                />
              )}
            </div>
          ))}
        </div>
      </section>

    </ScreenLayout>
  );
}
