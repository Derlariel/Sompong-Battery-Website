"use client";
import ContactCTA from "@/components/ContactCTA";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="container error-page"><h1>ไม่สามารถโหลดข้อมูลได้</h1><p>กรุณาลองอีกครั้ง หรือติดต่อทีมงานได้ทันที</p><ContactCTA /><button className="btn btn-outline" onClick={reset}>ลองอีกครั้ง</button></main>; }
