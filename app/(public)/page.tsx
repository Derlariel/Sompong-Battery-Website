import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Wrench, Clock3, MapPin, Wallet, Check } from "lucide-react";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import ContactCTA from "@/components/ContactCTA";
import AreaDirectory from "@/components/AreaDirectory";
import PortfolioGallery from "@/components/PortfolioGallery";
import StoreLocation from "@/components/StoreLocation";
import ServiceGallery from "@/components/ServiceGallery";
import { getContent } from "@/lib/content";
import { businessSchema, jsonLd } from "@/lib/seo";
export const revalidate = 300;
export function generateMetadata(): Metadata {
  const title = "สมปองแบตเตอรี่ | เปลี่ยนแบตเตอรี่ถึงที่ 24 ชั่วโมง";
  const description = "บริการเปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่ทั่วกรุงเทพฯ ตลอด 24 ชั่วโมง โทร 087-252-7842 ปรึกษาและตรวจเช็กฟรี";
  return { title: { absolute: title }, description, alternates: { canonical: "/" }, openGraph: { title, description, url: "/", locale: "th_TH", type: "website" } };
}
export default async function HomePage() {
  const { slides, areas, posts, photos, portfolioTotal } = await getContent();
  return <main id="main"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(businessSchema()) }} /><Hero slides={slides} />
    <div className="assurance-bar container"><span><Check />พร้อมบริการทุกวัน</span><span><Check />ตรวจเช็กก่อนเปลี่ยน</span><span><Check />แจ้งราคาก่อนทำงาน</span><span><Check />ชำระหลังรับบริการ</span></div>
    <section className="service-context section container" aria-labelledby="service-context-title">
      <div className="service-context-media">
        <Image src="/assets/images/service-areas/service-car.jpg" alt="ช่างกำลังตรวจเช็กแบตเตอรี่รถยนต์นอกสถานที่" width={2048} height={1536} sizes="(max-width: 760px) calc(100vw - 36px), 58vw" />
      </div>
      <div className="service-context-copy">
        <p className="eyebrow">บริการถึงที่ · พร้อมตลอด 24 ชั่วโมง</p>
        <h2 id="service-context-title">เปลี่ยนแบตเตอรี่นอกสถานที่ กรุงเทพฯ และปริมณฑล</h2>
        <p className="service-context-lede">บริการเปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่ตลอด 24 ชั่วโมง</p>
        <ul className="service-context-list">
          <li><Check aria-hidden="true" /><span>พื้นที่กรุงเทพฯ และปริมณฑล สาขาใกล้คุณ โดยปกติถึงที่ไม่เกิน 30 นาที ขึ้นอยู่กับพิกัดและการจราจร</span></li>
          <li><Check aria-hidden="true" /><span>ชำระปลายทางเมื่อได้รับและติดตั้งแบตเตอรี่เรียบร้อย</span></li>
          <li><Check aria-hidden="true" /><span>รับชำระด้วยเงินโอนหรือเงินสดที่หน้างาน</span></li>
          <li><Check aria-hidden="true" /><span>แบตเตอรี่ใหม่แกะกล่อง พร้อมใบรับประกัน 1–2 ปี</span></li>
          <li><Check aria-hidden="true" /><span>บริการติดตั้งถึงที่โดยช่างมืออาชีพ</span></li>
        </ul>
        <p className="service-context-thanks">ขอบคุณที่ใช้บริการและไว้วางใจเรา</p>
      </div>
    </section>
    <section id="services" className="section container"><div className="section-heading"><div><p className="eyebrow">บริการของเรา</p><h2>เรื่องแบตเตอรี่<br />ให้เราดูแลถึงที่</h2></div><p>ไม่ต้องหารถลาก ไม่ต้องเข้าร้าน<br />รับคำปรึกษา พร้อมบริการที่จุดจอดรถของคุณ</p></div>
      <ServiceGallery />
      <div className="service-grid">{[
      { icon: BatteryCharging, number: "01", title: "เปลี่ยนแบตเตอรี่ถึงที่", text: "แนะนำแบตเตอรี่ให้เหมาะกับรุ่นรถ พร้อมติดตั้งและตรวจเช็กหลังเปลี่ยน" },
      { icon: Wrench, number: "02", title: "ตรวจเช็กและให้คำปรึกษา", text: "รถสตาร์ทไม่ติด หรือไม่แน่ใจว่าแบตเสื่อม โทรปรึกษาและตรวจเช็กเบื้องต้นฟรี" },
      { icon: Clock3, number: "03", title: "ช่วยเหลือตลอด 24 ชม.", text: "เช้า กลางวัน หรือกลางดึก ทีมงานพร้อมรับสายทุกวัน ไม่เว้นวันหยุด" },
    ].map(item => <ServiceCard key={item.number} {...item} />)}</div><div id="services-contact" className="services-contact"><p>รถสตาร์ทไม่ติด? โทรปรึกษาหรือส่งพิกัดทาง LINE ได้เลย</p><ContactCTA /></div></section>
    <section className="coverage-band"><div className="container coverage-grid"><div><MapPin /><h3>ครอบคลุมทั่วกรุงเทพฯ</h3><p>พร้อมทุกวัน ไม่เว้นวันหยุด ปรึกษาและตรวจเช็กฟรี ถึงที่ประมาณ 30 นาที สอบถามเวลาถึงจริงตามพิกัดและการจราจร</p></div><div><Clock3 /><h3>พร้อมเมื่อคุณต้องการ</h3><p>รถสตาร์ทไม่ติด โทรได้ทุกเวลา บริการเปลี่ยนแบตเตอรี่โดยช่างผู้ชำนาญ พร้อมให้คำแนะนำหน้างาน</p></div><div><Wallet /><h3>จ่ายง่ายหลังรับบริการ</h3><p>รับเงินสดหรือโอนผ่านธนาคารและแอปมือถือ ชำระที่หน้างานเมื่อรับบริการเรียบร้อย</p></div></div></section>
    <section id="areas" className="section container"><div className="section-heading"><div><p className="eyebrow">ใกล้คุณ พร้อมบริการ 24 ชั่วโมง</p><h2>พื้นที่ให้บริการ</h2></div><p>ครอบคลุมพื้นที่กรุงเทพ<br />เลือกเขตของคุณเพื่อดูรายละเอียดบริการ</p></div><AreaDirectory areas={areas} /></section>
    {(posts.length > 0 || photos.length > 0) && <section id="portfolio" className="section portfolio-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">จากหน้างานจริง</p><h2>ผลงานของเรา</h2></div><p>ภาพบริการเปลี่ยนแบตเตอรี่ถึงที่จากลูกค้าจริง<br />ดูแลโดยทีมช่างของสมปองแบตเตอรี่</p></div>{posts.length > 0 && <div className="portfolio-grid mb-8">{posts.map(post => <article className="portfolio-card" key={post.id}>{post.photos[0] && <Image src={post.photos[0].url} alt={post.photos[0].alt} width={640} height={420} sizes="(max-width: 760px) 100vw, 33vw" loading="lazy" />}<div>{post.area && <span className="eyebrow">เขต{post.area.name}</span>}<h3>{post.title}</h3><p className="pre-line">{post.content}</p></div></article>)}</div>}<PortfolioGallery photos={photos} />{portfolioTotal > photos.length && <div className="portfolio-more"><Link className="btn btn-outline" href="/portfolio">ดูผลงานทั้งหมด {portfolioTotal} ภาพ</Link></div>}</div></section>}
    <StoreLocation />
  </main>;
}
