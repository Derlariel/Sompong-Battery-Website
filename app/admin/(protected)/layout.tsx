import Link from "next/link";
import { BatteryCharging } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { resourceLabels } from "@/lib/admin";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="brand"><BatteryCharging className="yellow-text" />สมพงษ์แบตเตอรี่</Link><nav aria-label="เมนูผู้ดูแล"><Link href="/admin">ภาพรวม</Link>{Object.entries(resourceLabels).map(([key, label]) => <Link key={key} href={`/admin/${key}`}>{label}</Link>)}</nav><form action="/api/auth/logout" method="post"><button className="btn btn-outline">ออกจากระบบ</button></form><p className="muted">{admin.username}</p><Link className="yellow-text" href="/">ดูเว็บไซต์ ↗</Link></aside><main className="admin-content">{children}</main></div>;
}
