import HeroSwiper from "./HeroSwiper";
import type { defaultSlides } from "@/lib/defaults";

export default function Hero({ slides }: { slides: typeof defaultSlides }) { return <HeroSwiper slides={slides} />; }
