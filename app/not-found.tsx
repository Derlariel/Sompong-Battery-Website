import Link from "next/link";
import ContactCTA from "@/components/ContactCTA";
export default function NotFound() { return <main className="container error-page"><p className="eyebrow">404</p><h1>ไม่พบหน้าที่คุณต้องการ</h1><p>กลับไปหน้าแรกเพื่อเลือกพื้นที่ให้บริการ หรือติดต่อเราได้ทันที</p><ContactCTA /><Link className="btn btn-outline" href="/">กลับหน้าแรก</Link></main>; }
