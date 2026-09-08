"use client";
import { useEffect, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";
import { ArrowLeft, ArrowRight, Pause, Play, Clock3, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import ContactCTA, { ContactLink } from "./ContactCTA";
import { contact, defaultSlides } from "@/lib/defaults";
import "swiper/css";

export default function HeroSwiper({ slides }: { slides: typeof defaultSlides }) {
  const [swiper, setSwiper] = useState<SwiperType>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    if (!swiper) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) { swiper.autoplay.start(); setPaused(false); }
  }, [swiper]);
  const items = slides.length ? slides : defaultSlides.slice(0, 1);
  return <section className="hero container" aria-label="บริการเปลี่ยนแบตเตอรี่">
    <div className="hero-main"><p className="eyebrow"><span />บริการฉุกเฉินนอกสถานที่</p>
      <Swiper modules={[A11y, Autoplay]} autoplay={{ delay: 6500, pauseOnMouseEnter: true, disableOnInteraction: true }} onInit={s => s.autoplay.stop()} onAutoplayStart={() => setPaused(false)} onAutoplayStop={() => setPaused(true)} onSwiper={setSwiper} onSlideChange={s => setActive(s.activeIndex)} a11y={{ enabled: true, containerMessage: "บริการของสมพงษ์แบตเตอรี่" }}>
        {items.map((slide, index) => <SwiperSlide key={slide.id}><div className="hero-slide" inert={index !== active}>
          <h1>{slide.title.split("\n").map((line, i) => <span key={i} className={i ? "yellow-text" : ""}>{line}</span>)}</h1>
          <p className="hero-description">{slide.subtitle}</p>
          {slide.imageUrl && <Image className="hero-photo" src={slide.imageUrl} alt={slide.title.replaceAll("\n", " ")} width={700} height={360} priority={index === 0} />}
          <ContactCTA />
          {slide.linkUrl !== contact.tel && slide.linkUrl !== contact.line && <a className="hero-extra" href={slide.linkUrl}>ดูรายละเอียด <ArrowRight size={17} /></a>}
        </div></SwiperSlide>)}
      </Swiper>
      <div className="hero-bottom"><span><ShieldCheck size={18} />ปรึกษาฟรี · ตรวจเช็กฟรี</span><div className="slider-controls"><span>{String(active + 1).padStart(2, "0")} <span className="muted">/ {String(items.length).padStart(2, "0")}</span></span><button aria-label="สไลด์ก่อนหน้า" disabled={active === 0} onClick={() => swiper?.slidePrev()}><ArrowLeft size={18} /></button><button aria-label={paused ? "เล่นสไลด์อัตโนมัติ" : "หยุดสไลด์อัตโนมัติ"} onClick={() => { if (paused) swiper?.autoplay.start(); else swiper?.autoplay.stop(); setPaused(!paused); }}>{paused ? <Play size={15} /> : <Pause size={15} />}</button><button aria-label="สไลด์ถัดไป" disabled={active === items.length - 1} onClick={() => swiper?.slideNext()}><ArrowRight size={18} /></button></div></div>
    </div>
    <aside className="dispatch-card"><div className="dispatch-top"><span className="status-dot" />พร้อมรับสาย</div><div className="dispatch-time">24<span>ชั่วโมง</span></div><h2>คุณอยู่ที่ไหน<br />เราพร้อมไปดูแล</h2><div className="dispatch-detail"><MapPin size={20} /><span>ทุกเขตในกรุงเทพฯ<br /><small>และพื้นที่ใกล้เคียง</small></span></div><div className="dispatch-detail"><Clock3 size={20} /><span>ถึงที่ประมาณ 30 นาที<small>ขึ้นอยู่กับระยะทางและการจราจร</small></span></div><ContactLink channel="call">โทรให้เราช่วยตอนนี้ <ArrowUpRightIcon /></ContactLink><p>แจ้งรุ่นรถและพิกัด เพื่อประเมินก่อนเดินทาง</p></aside>
  </section>;
}
function ArrowUpRightIcon() { return <ArrowRight size={17} className="rotate-arrow" />; }
