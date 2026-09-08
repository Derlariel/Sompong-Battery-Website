"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BatteryCharging } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace("/admin"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้"); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><div className="login-card"><BatteryCharging size={40} /><h1>เข้าสู่ระบบผู้ดูแล</h1><p>สมปองแบตเตอรี่ · จัดการข้อมูลเว็บไซต์</p>{!configured && <div className="notice">ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาตั้งค่า DATABASE_URL และ NEXTAUTH_SECRET จากนั้นสร้างบัญชีด้วยคำสั่ง db:seed ตาม SETUP.md</div>}<form onSubmit={submit}><label className="form-field">ชื่อผู้ใช้<input name="username" autoComplete="username" required maxLength={100} disabled={!configured || busy} /></label><label className="form-field">รหัสผ่าน<input name="password" type="password" autoComplete="current-password" required maxLength={72} disabled={!configured || busy} /></label>{error && <p className="notice notice-error" role="alert">{error}</p>}<Button disabled={!configured || busy} type="submit">{busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</Button></form><Link className="back-link" style={{ margin: "1.5rem 0 0" }} href="/">← กลับเว็บไซต์</Link></div></main>;
}
