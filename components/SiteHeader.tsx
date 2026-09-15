"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { ContactLink } from "./ContactCTA";
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <>
    <div className="availability">
      <div className="container availability-inner"><span className="status-dot" />พร้อมให้บริการตลอด 24 ชั่วโมง <span className="availability-area">ทั่วกรุงเทพฯ</span></div>
    </div>
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand" aria-label="สมปองแบตเตอรี่ หน้าแรก">
          <span><Image src="/assets/icons/sompong-battery-logo-horizontal.png" alt="สมปองแบตเตอรี่" width={250} height={60} /></span>
        </Link>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"} aria-controls="site-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="site-navigation" className="site-nav" aria-label="เมนูหลัก" data-open={menuOpen}>
          <Link href="/#services" onClick={() => setMenuOpen(false)}>บริการของเรา</Link>
          <Link href="/#areas" onClick={() => setMenuOpen(false)}>พื้นที่ให้บริการ</Link>
          <Link href="/#location" onClick={() => setMenuOpen(false)}>ที่ตั้งร้าน</Link>
          <Link href="/#contact" onClick={() => setMenuOpen(false)}>ติดต่อเรา <ArrowUpRight size={15} /></Link>
        </nav>
        <div className="header-call"><ContactLink channel="call" /></div>
      </div>
    </header>
  </>;
}
