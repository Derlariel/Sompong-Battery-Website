import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import ContactCTA from "@/components/ContactCTA";
import { getAreaContent } from "@/lib/content";
import { businessSchema, jsonLd, siteUrl } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { area } = await getAreaContent(slug);
  if (!area) return {};
  const title = `เปลี่ยนแบตเตอรี่ เขต${area.name} 24 ชั่วโมง`;
  const description = area.description.slice(0, 160);
  return { title, description, alternates: { canonical: `/service-area/${slug}` }, openGraph: { title, description, url: `/service-area/${slug}`, locale: "th_TH", type: "website" } };
}
export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const { area, posts } = await getAreaContent(slug);
  if (!area) notFound();
  return <main id="main" className="container district-page"><Link className="back-link" href="/#areas"><ArrowLeft size={17} />พื้นที่ให้บริการทั้งหมด</Link><p className="eyebrow"><MapPin size={16} />กรุงเทพมหานคร · เขต{area.name}</p><h1>เปลี่ยนแบตเตอรี่ถึงที่<br /><span className="yellow-text">เขต{area.name}</span></h1><p className="district-description pre-line">{area.description}</p><ContactCTA /><p className="muted">พร้อมให้บริการตลอด 24 ชั่วโมง โทร 087-252-7842</p><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([businessSchema(area), { "@context": "https://schema.org", "@type": "Service", name: `เปลี่ยนแบตเตอรี่ เขต${area.name}`, serviceType: "เปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่", areaServed: `เขต${area.name} กรุงเทพมหานคร`, provider: { "@id": `${siteUrl()}/#business` }, url: `${siteUrl()}/service-area/${slug}` }]) }} />{posts.length > 0 && <section className="section"><h2>ผลงานในเขต{area.name}</h2><div className="portfolio-grid">{posts.map(post => <article className="portfolio-card" key={post.id}>{post.photos.map(photo => <Image src={photo.url} alt={photo.alt} key={photo.id} width={640} height={420} sizes="(max-width: 760px) 100vw, 33vw" loading="lazy" />)}<div><h3>{post.title}</h3><p className="pre-line">{post.content}</p></div></article>)}</div></section>}</main>;
}
