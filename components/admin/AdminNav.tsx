"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { resourceLabels } from "@/lib/admin";

export default function AdminNav() {
  const pathname = usePathname();
  const entries = [["", "ภาพรวม"], ...Object.entries(resourceLabels)];
  return <nav aria-label="เมนูผู้ดูแล">{entries.map(([key, label]) => {
    const href = key ? `/admin/${key}` : "/admin";
    return <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>;
  })}</nav>;
}
