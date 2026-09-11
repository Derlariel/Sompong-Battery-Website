"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, CircleCheck } from "lucide-react";
import ContactCTA from "@/components/ContactCTA";

const provinceSlugs = new Set(["bangkok"]);

export default function AreaDirectory({ areas }: { areas: { slug: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const matches = areas.filter(area => area.name.includes(query.trim()) || area.slug.includes(query.toLowerCase().trim()));
  const provinces = matches.filter(area => provinceSlugs.has(area.slug));
  const districts = matches.filter(area => !provinceSlugs.has(area.slug));

  const cards = (items: typeof areas, province = false) => <div className="area-grid">{items.map(area => <Link href={`/service-area/${area.slug}`} key={area.slug}><CircleCheck aria-hidden="true" size={20} /><strong>{province ? area.name : `เขต${area.name}`}</strong></Link>)}</div>;

  return <><div className="area-search"><Search size={20} /><input aria-label="ค้นหาพื้นที่ให้บริการ" placeholder="ค้นหาเขต เช่น บางนา, ลาดพร้าว" value={query} onChange={event => setQuery(event.target.value)} /></div>{matches.length ? <><div className="area-directory">{provinces.length > 0 && <section aria-labelledby="province-heading"><p className="area-group-label" id="province-heading">จังหวัดที่ให้บริการ</p>{cards(provinces, true)}</section>}{districts.length > 0 && <section aria-labelledby="district-heading"><p className="area-group-label" id="district-heading">เขตในกรุงเทพฯ</p>{cards(districts)}</section>}</div><p className="area-count" aria-live="polite">พบพื้นที่ให้บริการ {matches.length} พื้นที่</p></> : <div className="area-empty" aria-live="polite"><h3>ยังไม่พบพื้นที่ที่ค้นหา</h3><p>โทรสอบถามพื้นที่ใกล้เคียง หรือส่งพิกัดให้ทีมงานตรวจสอบได้ตลอด 24 ชั่วโมง</p><ContactCTA /></div>}</>;
}
