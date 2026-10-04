"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BatteryCharging } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inMemoryPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseClientAuth } from "@/lib/firebase/client";
export default function LoginForm({ configured, firebaseMode }: { configured: boolean; firebaseMode: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const credentials = Object.fromEntries(data);
      let body: Record<string, unknown> = credentials;
      if (firebaseMode) {
        const auth = firebaseClientAuth();
        await setPersistence(auth, inMemoryPersistence);
        body = { idToken: await (await signInWithEmailAndPassword(auth, String(credentials.email), String(credentials.password))).user.getIdToken() };
      }
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace("/admin"); router.refresh();
    } catch (error) { setError(firebaseMode ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีไม่มีสิทธิ์ผู้ดูแล" : error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้"); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><div className="login-card"><BatteryCharging size={40} /><h1>เข้าสู่ระบบผู้ดูแล</h1><p>สมปองแบตเตอรี่ · จัดการข้อมูลเว็บไซต์</p>{!configured && <div className="notice">ระบบผู้ดูแลยังตั้งค่าไม่ครบ กรุณาตรวจสอบตัวแปรแวดล้อมตาม SETUP.md</div>}<form onSubmit={submit}><label className="form-field">{firebaseMode ? "อีเมล" : "ชื่อผู้ใช้"}<input name={firebaseMode ? "email" : "username"} type={firebaseMode ? "email" : "text"} autoComplete="username" required maxLength={100} disabled={!configured || busy} /></label><label className="form-field">รหัสผ่าน<input name="password" type="password" autoComplete="current-password" required maxLength={72} disabled={!configured || busy} /></label>{error && <p className="notice notice-error" role="alert">{error}</p>}<Button disabled={!configured || busy} type="submit">{busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</Button></form><Link className="back-link" style={{ margin: "1.5rem 0 0" }} href="/">← กลับเว็บไซต์</Link></div></main>;
}
