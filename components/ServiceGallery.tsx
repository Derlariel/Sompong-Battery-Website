"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const slides = [
  { image: "/assets/images/service-areas/116780_0.jpg", alt: "ช่างกำลังเปลี่ยนแบตเตอรี่รถยนต์ที่จุดจอดรถ", title: "เปลี่ยนแบตเตอรี่ถึงที่", text: "ดูแลรถหลากหลายรุ่น ณ จุดจอดของคุณ" },
  { image: "/assets/images/service-areas/116793_0.jpg", alt: "ช่างกำลังตรวจเช็กแบตเตอรี่ภายในห้องเครื่องรถยนต์", title: "ตรวจเช็กโดยช่าง", text: "ตรวจสอบระบบก่อนติดตั้งแบตเตอรี่ใหม่" },
  { image: "/assets/images/service-areas/116799_0.jpg", alt: "ช่างกำลังติดตั้งแบตเตอรี่ให้รถยนต์หน้าบ้านลูกค้า", title: "บริการถึงหน้าบ้าน", text: "ไม่ต้องนำรถเข้าร้าน ช่างไปดูแลถึงที่" },
  { image: "/assets/images/service-areas/116798_0.jpg", alt: "ช่างกำลังดูแลแบตเตอรี่รถสปอร์ตที่จุดจอดรถ", title: "พร้อมดูแลทุกสถานการณ์", text: "เข้าถึงตำแหน่งแบตเตอรี่และติดตั้งอย่างเหมาะสม" },
  { image: "/assets/images/service-areas/116790_0.jpg", alt: "ช่างกำลังตรวจเช็กแบตเตอรี่รถยนต์ในเวลากลางคืน", title: "ช่วยเหลือได้ตลอด 24 ชั่วโมง", text: "พร้อมให้บริการทั้งกลางวันและกลางคืน" },
  { image: "/assets/images/service-areas/116791_0.jpg", alt: "แบตเตอรี่ที่ติดตั้งเรียบร้อยภายในห้องเครื่องรถยนต์", title: "ติดตั้งเรียบร้อยเหมาะกับรถ", text: "เลือกขนาดและตำแหน่งติดตั้งให้ถูกต้อง" },
  { image: "/assets/images/service-areas/116792_0.jpg", alt: "ช่างกำลังตรวจเช็กแบตเตอรี่รถยนต์ภายในลานจอด", title: "ตรวจสอบหลังติดตั้ง", text: "เช็กความเรียบร้อยก่อนส่งมอบรถให้ลูกค้า" },
  { image: "/assets/images/service-areas/116797_0.jpg", alt: "ช่างกำลังเข้าถึงตำแหน่งแบตเตอรี่บริเวณท้ายรถ", title: "เข้าถึงแบตเตอรี่ทุกตำแหน่ง", text: "ดูแลตามโครงสร้างและรุ่นของรถแต่ละคัน" },
];

export default function ServiceGallery() {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [active, setActive] = useState(0);

  return <div className="service-gallery">
    <Swiper modules={[A11y]} slidesPerView={1.08} spaceBetween={16} breakpoints={{ 760: { slidesPerView: 2, spaceBetween: 20 } }} rewind onSwiper={setSwiper} onSlideChange={instance => setActive(instance.realIndex)} a11y={{ enabled: true, containerMessage: "ภาพบริการเปลี่ยนแบตเตอรี่ถึงที่" }} className="service-swiper">
      {slides.map(slide => <SwiperSlide key={slide.image}><figure className="service-visual"><Image src={slide.image} alt={slide.alt} fill sizes="(max-width: 760px) 86vw, 43vw" /><figcaption><small>บริการหน้างาน</small><strong>{slide.title}</strong><span>{slide.text}</span></figcaption></figure></SwiperSlide>)}
    </Swiper>
    <div className="service-gallery-controls" role="group" aria-label="ควบคุมภาพบริการ">
      <span aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
      <button type="button" onClick={() => swiper?.slidePrev()} aria-label="ภาพบริการก่อนหน้า"><ArrowLeft size={20} aria-hidden="true" /></button>
      <button type="button" onClick={() => swiper?.slideNext()} aria-label="ภาพบริการถัดไป"><ArrowRight size={20} aria-hidden="true" /></button>
    </div>
  </div>;
}
