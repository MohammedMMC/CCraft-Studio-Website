
import ScreenLayout from "../components/ScreenLayout";
import Button from "../components/Button";
import Image from "next/image";
import PreviewSwiper from "../components/PreviewSwiper";

export default function HomePage() {
  return (
    <ScreenLayout>
      {/* Main Section */}
      <section className="flex md:flex-row-reverse flex-col justify-between items-center md:gap-12 py-2">
        <Image className="size-[calc(200px+15vw)] max-w-96 h-auto aspect-square" src="/images/icon.png" alt="CCraft Studio Logo" width={1000} height={1000} loading="eager"/>
        <div className="w-full max-w-xl">
          <h1 className="font-bold lg:text-5xl md:text-[calc(20px+1vw)] sm:text-3xl text-2xl sm:my-10 my-4">Design and Build <br /> apps with ease</h1>
          <p className="md:text-lg text-md">An easy-to-use studio application that helps you to quickly and easily build systems/apps for <b className="whitespace-nowrap">CC: Tweaked</b> minecraft mod.</p>
          <Button className="w-full max-w-2xs mt-12 justify-center">Download</Button>
        </div>
      </section>

      {/* Images Section */}
      <PreviewSwiper />

    </ScreenLayout>
  );
}
