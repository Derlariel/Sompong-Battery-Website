import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function Dashboard() {
  await requireAdmin();
  const counts = await Promise.all([prisma.post.count(), prisma.photo.count(), prisma.heroSlide.count(), prisma.serviceArea.count()]);
  const sections = [["posts", "ผลงาน / บทความ"], ["photos", "รูปภาพ"], ["hero-slides", "สไลด์หน้าแรก"], ["service-areas", "พื้นที่ให้บริการ"]];
  return <><div className="admin-heading"><div><p className="eyebrow">ผู้ดูแลเว็บไซต์</p><h1>ภาพรวม</h1><p>จัดการข้อมูลสมปองแบตเตอรี่</p></div></div><div className="admin-stats">{sections.map(([slug, label], i) => <div className="admin-stat admin-stat-disabled" aria-disabled="true" key={slug}><span className="coming-soon-badge">Coming soon</span><strong>{counts[i]}</strong><span>{label}</span></div>)}</div><div className="notice">ระบบจัดการเนื้อหากำลังพัฒนาและยังไม่เปิดใช้งาน</div></>;
}
