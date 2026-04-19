'use client';

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const previewImages = [
  "/images/preview1.png",
  "/images/preview2.png",
  "/images/preview3.png",
];

export default function PreviewSwiper() {
  return (
    <section className="my-14 w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        pagination={{ clickable: true }}
        autoplay={{
          delay: 2800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        allowTouchMove
        simulateTouch
        watchOverflow
        observer
        observeParents
        touchStartPreventDefault={false}
        edgeSwipeDetection="prevent"
        edgeSwipeThreshold={24}
        resistanceRatio={0.85}
        threshold={5}
        spaceBetween={18}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 1.5 },
          1024: { slidesPerView: 2 },
        }}
        className="preview-swiper"
      >
        {previewImages.map((src, index) => (
          <SwiperSlide key={src}>
            <Image
              className="border-lime/80 shadow-lime shadow-[0_4px_0_0] border-4 aspect-video h-64 w-full object-cover select-none pointer-events-none"
              src={src}
              alt={`CCraft Studio Preview ${index + 1}`}
              width={1280}
              height={720}
              priority={index === 0}
              draggable={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
