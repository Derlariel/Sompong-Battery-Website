import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ContactLink } from "./ContactCTA";
export default function SiteHeader() {
  return <><div className="availability"><span className="status-dot" />พร้อมให้บริการตลอด 24 ชั่วโมง <span className="availability-area">กรุงเทพฯ และปริมณฑล</span></div>
    <header className="site-header container">
      <Link href="/" className="brand" aria-label="สมปองแบตเตอรี่ หน้าแรก">
        <span>
          <Image src="/assets/icons/logo.png" alt="" width={60} height={60} sizes="60px" />
        </span>
        <span>สมปอง<span className="brand-sub">แบตเตอรี่ • SOMPONG BATTERY</span></span>
      </Link>
      <nav aria-label="เมนูหลัก"><Link href="/#services">บริการของเรา</Link><Link href="/#areas">พื้นที่ให้บริการ</Link><Link href="/#contact">ติดต่อเรา <ArrowUpRight size={15} /></Link></nav>
      <div className="header-call"><ContactLink channel="call" /></div>
    </header></>;
}
