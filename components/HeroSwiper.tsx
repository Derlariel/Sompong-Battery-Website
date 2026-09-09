"use client";

import Image from "next/image";
import { MessageCircle, Pause, Phone, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade } from "swiper/modules";
import type { defaultSlides } from "@/lib/defaults";
import "swiper/css";
import "swiper/css/effect-fade";

const fallbackSlides = [
  {
    image: "/assets/images/hero/้hero-1-machanic.jpg",
    alt: "ช่างตรวจเช็คระบบไฟและเปลี่ยนแบตเตอรี่หน้างาน",
    caption: "ตรวจเช็คถึงในห้องเครื่อง ไม่ต้องลากรถเข้าศูนย์",
  },
  {
    image: "/assets/images/hero/hero-2-machanic.jpg",
    alt: "บริการเปลี่ยนแบตเตอรี่ถึงในรถ Porsche",
    caption: "รถหรูแค่ไหนก็ดูแลได้ ทีมงานถึงในสายเดียว",
  },
  {
    image: "/assets/images/hero/hero-3-machanic.jpg",
    alt: "บริการเปลี่ยนแบตเตอรี่รถสปอร์ต Lamborghini ถึงหน้าคอนโด",
    caption: "กลางคืนแค่ไหนก็ไป — สตาร์ทไม่ติดโทรได้ทันที",
  },
];

export default function HeroSwiper({ slides: configuredSlides }: { slides: typeof defaultSlides }) {
  const [active, setActive] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const slides = configuredSlides.length
    ? configuredSlides.map((slide, index) => {
        const fallback = fallbackSlides[index % fallbackSlides.length];
        return {
          image: slide.imageUrl || fallback.image,
          alt: slide.title.replaceAll("\n", " "),
          caption: slide.subtitle || fallback.caption,
        };
      })
    : fallbackSlides;
  const activeSlide = slides[active] ?? slides[0];
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      if (mediaQuery.matches) {
        swiper?.autoplay.stop();
        setIsPaused(true);
      }
    };
    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, [swiper]);

  function toggleAutoplay() {
    if (!swiper) return;
    const nextPaused = !isPaused;
    if (nextPaused) swiper.autoplay.stop();
    else swiper.autoplay.start();
    setIsPaused(nextPaused);
  }

  return (
    <section
      aria-label="บริการเปลี่ยนแบตเตอรี่"
      className="relative isolate mx-auto aspect-[16/8.2] w-full max-w-[1280px] overflow-hidden bg-[#081120] shadow-[0_30px_80px_rgba(0,0,0,.5)] max-[720px]:aspect-[9/14]"
    >
      <Swiper
        modules={[A11y, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={hasMultipleSlides ? { delay: 4800, disableOnInteraction: true, pauseOnMouseEnter: true } : false}
        loop={hasMultipleSlides}
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActive(instance.realIndex)}
        onSliderFirstMove={() => setIsPaused(true)}
        a11y={{ enabled: true, containerMessage: "ภาพบริการของสมปองแบตเตอรี่" }}
        className="absolute inset-0 z-0 h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.image}-${index}`}>
            <div className="relative h-full w-full">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 720px) 100vw, 1280px"
                className="object-cover [filter:saturate(1.05)_contrast(1.03)]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(100deg, rgba(8,17,32,.94) 0%, rgba(8,17,32,.82) 28%, rgba(8,17,32,.35) 52%, rgba(8,17,32,.15) 68%, rgba(8,17,32,.55) 100%), linear-gradient(0deg, rgba(8,17,32,.75) 0%, rgba(8,17,32,0) 30%)",
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-0 z-20 flex h-full max-w-[640px] flex-col justify-center px-[6%] pb-[7%] pt-[6.5%] max-[720px]:max-w-none max-[720px]:px-[7%] max-[720px]:pb-[14%] max-[720px]:pt-[9%]">
        <div
          className="mb-[1.1em] flex w-fit items-center gap-[.55rem] rounded-[3px] bg-[#E5342B] px-[.95em] pb-[.45em] pt-[.4em] font-bold tracking-[.02em] text-white"
          style={{ fontSize: "clamp(13px, 1.6vw, 15px)" }}
        >
          <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-[#FFC53D] shadow-[0_0_0_3px_rgba(255,197,61,.35)]" />
          เปิดบริการ 24 ชั่วโมง ไม่มีวันหยุด
        </div>

        <h1
          className="font-extrabold text-[#F4F6F9]"
          style={{
            fontSize: "clamp(30px, 4.6vw, 54px)",
            lineHeight: 1.12,
            letterSpacing: "-.01em",
          }}
        >
          รถสตาร์ทไม่ติด
          <br />
          เราไป<span className="text-[#FFC53D]">ถึงหน้ารถคุณ</span>
        </h1>

        <div className="my-[1.2em] flex items-center gap-[.6rem]">
          <svg aria-hidden="true" width="34" height="34" viewBox="0 0 34 34" fill="none" className="shrink-0">
            <path d="M6 6 C6 20, 14 20, 14 30" stroke="#E5342B" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="2" y="2" width="8" height="8" rx="2" fill="#E5342B" />
            <path d="M28 6 C28 20, 20 20, 20 30" stroke="#3A3F46" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="24" y="2" width="8" height="8" rx="2" fill="#9FB0C4" />
          </svg>
          <p className="m-0 text-[#9FB0C4]" style={{ fontSize: "clamp(14px, 1.7vw, 16.5px)", lineHeight: 1.55 }}>
            เช็คระบบไฟ ตรวจไดร์ชาร์จ-ไดร์สตาร์ท และเปลี่ยนแบตเตอรี่นอกสถานที่ทั่วกรุงเทพฯ
            โดยปกติประมาณ 30 นาที ขึ้นอยู่กับพิกัดและการจราจร
          </p>
        </div>

        <p className="mb-[1.6em] min-h-[1.4em] text-[#9FB0C4]" style={{ fontSize: "clamp(13px, 1.6vw, 15px)" }}>
          {activeSlide.caption}
        </p>

        <div className="flex flex-wrap gap-[.85rem]">
          <a
            href="tel:0872527842"
            className="inline-flex items-center gap-[.55rem] rounded-[4px] bg-[#FFC53D] px-[1.5em] py-[.9em] font-semibold text-[#081120] transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
            style={{ fontSize: "clamp(14px, 1.8vw, 16.5px)", lineHeight: 1.5 }}
            onClick={() => window.gtag?.("event", "conversion", { send_to: "AW-CONVERSION_ID/CALL_LABEL" })}
          >
            <Phone aria-hidden="true" size={18} fill="currentColor" />
            โทร 087-252-7842
          </a>
          <a
            href="https://line.me/ti/p/~sompong7842"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[.55rem] rounded-[4px] border-[1.5px] border-white/50 px-[1.5em] py-[.9em] font-semibold text-[#F4F6F9] transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
            style={{ fontSize: "clamp(14px, 1.8vw, 16.5px)", lineHeight: 1.5 }}
            onClick={() => window.gtag?.("event", "conversion", { send_to: "AW-CONVERSION_ID/LINE_LABEL" })}
          >
            <MessageCircle aria-hidden="true" size={18} fill="currentColor" />
            แชท LINE
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-[6%] left-[6%] z-30 flex items-center gap-[.5em] text-[#9FB0C4] max-[720px]:hidden"
        style={{ fontSize: "clamp(11px, 1.3vw, 13px)" }}
      >
        Sompong Battery <b className="font-semibold tracking-[.02em] text-[#F4F6F9]">·</b> บริการทุกเขตในกรุงเทพฯ
      </div>

      {hasMultipleSlides && (
        <div className="absolute bottom-[4%] right-[4%] z-30 flex items-center gap-1" role="group" aria-label="ควบคุมภาพบริการ">
          <button
            type="button"
            onClick={toggleAutoplay}
            className={`grid h-11 w-11 place-items-center rounded-full border transition ${isPaused ? "border-[#FFC53D] bg-[#FFC53D] text-[#081120]" : "border-white/30 bg-[#081120]/75 text-white hover:border-[#FFC53D] hover:text-[#FFC53D]"}`}
            aria-label={isPaused ? "เล่นสไลด์อัตโนมัติ" : "หยุดสไลด์อัตโนมัติ"}
            aria-pressed={isPaused}
            title={isPaused ? "เล่นสไลด์อัตโนมัติ" : "หยุดสไลด์อัตโนมัติ"}
          >
            {isPaused ? <Play size={17} fill="currentColor" aria-hidden="true" /> : <Pause size={17} fill="currentColor" aria-hidden="true" />}
          </button>
          {slides.map((slide, index) => (
            <button
              key={`${slide.image}-dot-${index}`}
              type="button"
              aria-label={`ไปยังสไลด์ ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              onClick={() => { swiper?.autoplay.stop(); setIsPaused(true); swiper?.slideToLoop(index); }}
              className="grid h-11 w-11 place-items-center border-0 bg-transparent p-0"
            ><span className="h-1 w-[26px] rounded-sm transition-colors duration-200" style={{ background: active === index ? "#FFC53D" : "rgba(255,255,255,.32)" }} /></button>
          ))}
        </div>
      )}
    </section>
  );
}
