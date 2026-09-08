import type { Metadata } from "next";
import Image from "next/image";
import { BatteryCharging, Wrench, Clock3, ArrowUpRight, MapPin, Wallet, Check } from "lucide-react";
import Hero from "@/components/Hero";
import AreaDirectory from "@/components/AreaDirectory";
import { getContent } from "@/lib/content";
import { businessSchema, jsonLd } from "@/lib/seo";
export function generateMetadata(): Metadata { return { alternates: { canonical: "/" } }; }
export default async function HomePage() {
  const { slides, areas, posts, photos } = await getContent();
  return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(businessSchema()) }} /><Hero slides={slides} />
    <div className="assurance-bar container"><span><Check />พร้อมบริการทุกวัน</span><span><Check />ตรวจเช็กก่อนเปลี่ยน</span><span><Check />แจ้งราคาก่อนทำงาน</span><span><Check />ชำระหลังรับบริการ</span></div>
    <section id="services" className="section container"><div className="section-heading"><div><p className="eyebrow">บริการของเรา</p><h2>เรื่องแบตเตอรี่<br />ให้เราดูแลถึงที่</h2></div><p>ไม่ต้องหารถลาก ไม่ต้องเข้าร้าน<br />รับคำปรึกษา พร้อมบริการที่จุดจอดรถของคุณ</p></div><div className="service-grid">{[
      { icon: BatteryCharging, number: "01", title: "เปลี่ยนแบตเตอรี่ถึงที่", text: "แนะนำแบตเตอรี่ให้เหมาะกับรุ่นรถ พร้อมติดตั้งและตรวจเช็กหลังเปลี่ยน" },
      { icon: Wrench, number: "02", title: "ตรวจเช็กและให้คำปรึกษา", text: "รถสตาร์ทไม่ติด หรือไม่แน่ใจว่าแบตเสื่อม โทรปรึกษาและตรวจเช็กเบื้องต้นฟรี" },
      { icon: Clock3, number: "03", title: "ช่วยเหลือตลอด 24 ชม.", text: "เช้า กลางวัน หรือกลางดึก ทีมงานพร้อมรับสายทุกวัน ไม่เว้นวันหยุด" },
    ].map(item => <article className="service-card" key={item.number}><div className="service-card-top"><item.icon size={30} /><span>{item.number}</span></div><h3>{item.title}</h3><p>{item.text}</p><a href="#contact">ติดต่อทีมงาน <ArrowUpRight size={18} /></a></article>)}</div></section>
    <section className="coverage-band"><div className="container coverage-grid"><div><MapPin /><h3>ครอบคลุมทั่วกรุงเทพฯ</h3><p>พร้อมเดินทางไปหาคุณประมาณ 30 นาที สอบถามเวลาถึงจริงตามพิกัดและสภาพการจราจร</p></div><div><Clock3 /><h3>พร้อมเมื่อคุณต้องการ</h3><p>รถสตาร์ทไม่ติด โทรได้ทุกเวลา บริการเปลี่ยนแบตเตอรี่โดยช่าง พร้อมให้คำแนะนำหน้างาน</p></div><div><Wallet /><h3>จ่ายง่ายหลังรับบริการ</h3><p>รับเงินสดหรือโอนผ่านธนาคารและแอปมือถือ ชำระที่หน้างานเมื่อรับบริการเรียบร้อย</p></div></div></section>
    <section id="areas" className="section container"><div className="section-heading"><div><p className="eyebrow">ใกล้คุณ ทุกเขต</p><h2>พื้นที่ให้บริการ</h2></div><p>เลือกเขตของคุณเพื่อดูรายละเอียด<br />พื้นที่ปริมณฑล โทรสอบถามเราได้เลย</p></div><AreaDirectory areas={areas} /></section>
    {(posts.length > 0 || photos.length > 0) && <section className="section portfolio-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">จากหน้างานจริง</p><h2>ผลงานของเรา</h2></div></div><div className="portfolio-grid">{posts.slice(0, 6).map(post => <article className="portfolio-card" key={post.id}>{post.photos[0] && <Image src={post.photos[0].url} alt={post.photos[0].alt} width={640} height={420} />}<div>{post.area && <span className="eyebrow">เขต{post.area.name}</span>}<h3>{post.title}</h3><p className="pre-line">{post.content}</p></div></article>)}</div><div className="photo-grid">{photos.filter(photo => !photo.postId).slice(0, 12).map(photo => <figure key={photo.id}><Image src={photo.url} alt={photo.alt} width={600} height={400} /><figcaption>{photo.alt}</figcaption></figure>)}</div></div></section>}
  </main>;
}
