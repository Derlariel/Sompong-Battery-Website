"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade } from "swiper/modules";
import type { defaultSlides } from "@/lib/defaults";
import { ContactLink } from "@/components/ContactCTA";
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
      className="relative isolate aspect-[16/8] min-h-[620px] max-h-[820px] w-full overflow-hidden bg-[#070707] max-[720px]:aspect-[9/14] max-[720px]:min-h-[660px] max-[720px]:max-h-none"
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
                sizes="100vw"
                className="object-cover [filter:saturate(1.05)_contrast(1.03)]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(100deg, rgba(7,7,7,.96) 0%, rgba(12,7,8,.84) 28%, rgba(12,7,8,.38) 52%, rgba(7,7,7,.18) 68%, rgba(7,7,7,.62) 100%), linear-gradient(0deg, rgba(7,7,7,.82) 0%, rgba(7,7,7,0) 30%)",
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-0 z-20 flex h-full max-w-[780px] flex-col justify-center px-[6%] pb-[7%] pt-[6.5%] max-[720px]:max-w-none max-[720px]:px-[7%] max-[720px]:pb-[14%] max-[720px]:pt-[9%]">
        <div className="hero-kicker">
          <span aria-hidden="true" />
          บริการแบตเตอรี่ฉุกเฉิน · กรุงเทพฯ
        </div>

        <h1 className="hero-message">
          รถสตาร์ทไม่ติด?
          <span>เปลี่ยนแบตถึงที่ 24 ชม.</span>
        </h1>

        <p className="hero-lede">
          โทรครั้งเดียว ช่างไปตรวจระบบไฟและเปลี่ยนแบตให้ถึงหน้ารถ
          <br className="max-[540px]:hidden" /> ทั่วกรุงเทพฯ โดยปกติประมาณ 30 นาที
        </p>

        <p className="hero-caption">
          {activeSlide.caption}
        </p>

        <div className="flex flex-wrap gap-[.85rem]" aria-label="ติดต่อขอรับบริการ">
          <ContactLink channel="call" className="hero-call-button">โทร 087-252-7842</ContactLink>
          <ContactLink channel="line" className="hero-line-button">แชท LINE</ContactLink>
        </div>
      </div>

      <div
        className="absolute bottom-[6%] left-[6%] z-30 flex items-center gap-[.5em] text-[#B9B2B4] max-[720px]:hidden"
        style={{ fontSize: "clamp(11px, 1.3vw, 13px)" }}
      >
        Sompong Battery <b className="font-semibold tracking-[.02em] text-[#F4F6F9]">·</b> บริการทั่วกรุงเทพฯ
      </div>

      {hasMultipleSlides && (
        <div className="absolute bottom-[4%] right-[4%] z-30 flex items-center gap-1" role="group" aria-label="ควบคุมภาพบริการ">
          <button
            type="button"
            onClick={toggleAutoplay}
            className={`grid h-11 w-11 place-items-center rounded-full border transition ${isPaused ? "border-[#E21F32] bg-[#E21F32] text-white" : "border-white/30 bg-black/75 text-white hover:border-[#FF3548] hover:text-[#FF3548]"}`}
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
            ><span className="h-1 w-[26px] rounded-sm transition-colors duration-200" style={{ background: active === index ? "#E21F32" : "rgba(255,255,255,.32)" }} /></button>
          ))}
        </div>
      )}
    </section>
  );
}
