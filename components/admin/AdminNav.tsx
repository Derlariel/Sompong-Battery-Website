"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Images, MapPinned, Presentation, Settings2 } from "lucide-react";

const items = [
  { href: "/admin", label: "ภาพรวม", icon: BarChart3 },
  { href: "/admin/posts", label: "ผลงาน / บทความ", icon: FileText },
  { href: "/admin/photos", label: "คลังรูปภาพ", icon: Images },
  { href: "/admin/hero-slides", label: "สไลด์หน้าแรก", icon: Presentation },
  { href: "/admin/service-areas", label: "พื้นที่ให้บริการ", icon: MapPinned },
  { href: "/admin/settings", label: "ตั้งค่าการติดตาม", icon: Settings2 },
];

export default function AdminNav() {
  const pathname = usePathname();
  return <nav aria-label="เมนูผู้ดูแล">
    <span className="admin-nav-label">เมนูจัดการ</span>
    {items.map(({ href, label, icon: Icon }) => (
      <Link href={href} aria-current={pathname === href ? "page" : undefined} key={href}>
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    ))}
  </nav>;
}
