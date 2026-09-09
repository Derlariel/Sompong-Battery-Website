"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { resourceLabels } from "@/lib/admin";

export default function AdminNav() {
  const pathname = usePathname();
  return <nav aria-label="เมนูผู้ดูแล">
    <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined}>ภาพรวม</Link>
    {Object.entries(resourceLabels).map(([key, label]) => <span className="admin-nav-disabled" aria-disabled="true" key={key}><span>{label}</span><small>Coming soon</small></span>)}
  </nav>;
}
