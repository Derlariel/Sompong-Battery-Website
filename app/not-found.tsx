import Link from "next/link";
export default function NotFound() { return <main className="container error-page"><p className="eyebrow">404</p><h1>ไม่พบหน้าที่คุณต้องการ</h1><p>กลับไปหน้าแรกเพื่อเลือกพื้นที่ให้บริการหรือติดต่อเรา</p><Link className="btn btn-primary" href="/">กลับหน้าแรก</Link></main>; }
