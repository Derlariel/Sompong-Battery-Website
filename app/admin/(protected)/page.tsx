import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function Dashboard() {
  await requireAdmin();
  const counts = await Promise.all([prisma.post.count(), prisma.photo.count(), prisma.heroSlide.count(), prisma.serviceArea.count()]);
  const sections = [["posts", "ผลงาน / บทความ"], ["photos", "รูปภาพ"], ["hero-slides", "สไลด์หน้าแรก"], ["service-areas", "พื้นที่ให้บริการ"]];
  return <><div className="admin-heading"><div><p className="eyebrow">ผู้ดูแลเว็บไซต์</p><h1>ภาพรวม</h1><p>จัดการข้อมูลสมพงษ์แบตเตอรี่</p></div></div><div className="admin-stats">{sections.map(([slug, label], i) => <Link className="admin-stat" href={`/admin/${slug}`} key={slug}><strong>{counts[i]}</strong><span>{label} ↗</span></Link>)}</div><div className="notice">เริ่มจากเพิ่มผลงาน แล้วอัปโหลดรูปภาพและเลือกผลงานที่เกี่ยวข้อง ข้อมูลที่บันทึกจะแสดงบนเว็บไซต์ทันที</div></>;
}
