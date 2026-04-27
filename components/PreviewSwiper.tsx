'use client';

import { useEffect, useRef, useState } from "react";
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shouldRenderSwiper, setShouldRenderSwiper] = useState(false);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldRenderSwiper(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(sectionElement);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="my-16 w-full">
      {shouldRenderSwiper ? (
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
                className="border-lime/80 shadow-lime shadow-[0_4px_0_0] border-4 aspect-video h-auto max-h-80 w-full select-none pointer-events-none"
                src={src}
                alt={`CCraft Studio Preview ${index + 1}`}
                width={1280}
                height={720}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw"
                draggable={false}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="h-72 w-full border-lime/80 shadow-lime shadow-[0_4px_0_0] border-4 aspect-video" />
      )}
    </section>
  );
}
