import Link from "next/link";
import { BatteryCharging, ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ContactCTA, { TrackingProvider } from "@/components/ContactCTA";
import Analytics from "@/components/Analytics";
import { getContent } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getContent();
  return <TrackingProvider config={settings}><a href="#main" className="skip-link">ข้ามไปเนื้อหา</a><Analytics config={settings} /><SiteHeader />{children}<section id="contact" className="contact-section"><div className="container contact-inner"><div><p className="eyebrow">ให้เราช่วยดูแลคุณ</p><h2>รถพร้อมไปต่อ<br />แค่โทรหาเรา</h2><p>แจ้งรุ่นรถ อาการ และพิกัดของคุณ<br />ทีมงานพร้อมให้คำแนะนำตลอด 24 ชั่วโมง</p></div><div><ContactCTA /><p className="contact-note">LINE ID: sompong7842</p></div></div></section><footer className="container footer"><div className="footer-brand"><BatteryCharging /> สมพงษ์แบตเตอรี่</div><p>เปลี่ยนแบตเตอรี่ถึงที่ กรุงเทพฯ และปริมณฑล</p><Link href="/admin">สำหรับผู้ดูแล <ArrowUpRight size={14} /></Link><small>© {new Date().getFullYear()} สมพงษ์แบตเตอรี่</small></footer><ContactCTA sticky /></TrackingProvider>;
}
