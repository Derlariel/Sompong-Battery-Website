"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import ContactCTA from "@/components/ContactCTA";
export default function AreaDirectory({ areas }: { areas: { slug: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const matches = areas.filter(area => area.name.includes(query.trim()) || area.slug.includes(query.toLowerCase().trim()));
  return <><div className="area-search"><Search size={20} /><input aria-label="ค้นหาเขตที่ให้บริการ" placeholder="ค้นหาเขตของคุณ เช่น บางนา" value={query} onChange={event => setQuery(event.target.value)} /></div>{matches.length ? <><div className="area-grid">{matches.map(area => <Link href={`/service-area/${area.slug}`} key={area.slug}>{area.name}<ArrowUpRight size={16} /></Link>)}</div><p className="area-count" aria-live="polite">พื้นที่ให้บริการ {matches.length} เขต</p></> : <div className="area-empty" aria-live="polite"><h3>ยังไม่พบพื้นที่ที่ค้นหา</h3><p>โทรสอบถามพื้นที่ใกล้เคียง หรือส่งพิกัดให้ทีมงานตรวจสอบได้ตลอด 24 ชั่วโมง</p><ContactCTA /></div>}</>;
}
