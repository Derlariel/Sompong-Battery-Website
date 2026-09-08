"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
export default function AreaDirectory({ areas }: { areas: { slug: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const matches = areas.filter(area => area.name.includes(query.trim()) || area.slug.includes(query.toLowerCase().trim()));
  return <><div className="area-search"><Search size={20} /><input aria-label="ค้นหาเขตที่ให้บริการ" placeholder="ค้นหาเขตของคุณ เช่น บางนา" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="area-grid">{matches.map(area => <Link href={`/service-area/${area.slug}`} key={area.slug}>{area.name}<ArrowUpRight size={16} /></Link>)}</div><p className="area-count" aria-live="polite">{matches.length ? `พื้นที่ให้บริการ ${matches.length} เขต` : "ไม่พบเขตที่ค้นหา โทรสอบถามพื้นที่ใกล้เคียงได้ตลอด 24 ชั่วโมง"}</p></>;
}
