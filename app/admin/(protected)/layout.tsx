import Link from "next/link";
import { BatteryCharging, ExternalLink, LogOut, UserRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <Link href="/admin" className="brand"><span className="admin-brand-icon"><BatteryCharging size={22} /></span><span>สมปองแบตเตอรี่<small>CONTROL CENTER</small></span></Link>
        <AdminNav />
      </div>
      <div className="admin-account">
        <div className="admin-user"><span><UserRound size={17} /></span><div><small>ผู้ดูแลระบบ</small><strong>{admin.username}</strong></div></div>
        <Link className="admin-site-link" href="/"><ExternalLink size={16} />ดูเว็บไซต์</Link>
        <form action="/api/auth/logout" method="post"><button><LogOut size={16} />ออกจากระบบ</button></form>
      </div>
    </aside>
    <main className="admin-content">{children}</main>
  </div>;
}
