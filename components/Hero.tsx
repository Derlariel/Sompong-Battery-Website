"use client";
import dynamic from "next/dynamic";
import type { defaultSlides } from "@/lib/defaults";
const HeroSwiper = dynamic(() => import("./HeroSwiper"));
export default function Hero({ slides }: { slides: typeof defaultSlides }) { return <HeroSwiper slides={slides} />; }
