"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="container error-page"><h1>ไม่สามารถโหลดข้อมูลได้</h1><p>กรุณาลองอีกครั้ง หรือติดต่อ 087-252-7842</p><button className="btn btn-primary" onClick={reset}>ลองอีกครั้ง</button></main>; }
