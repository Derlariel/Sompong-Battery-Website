import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "สมพงษ์แบตเตอรี่ | เปลี่ยนแบตเตอรี่ถึงที่ 24 ชั่วโมง", template: "%s | สมพงษ์แบตเตอรี่" },
  description: "บริการเปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่ กรุงเทพฯ และปริมณฑล ตลอด 24 ชั่วโมง โทร 087-252-7842 ปรึกษาและตรวจเช็กฟรี",
  openGraph: { locale: "th_TH", type: "website", siteName: "สมพงษ์แบตเตอรี่", title: "สมพงษ์แบตเตอรี่ | เปลี่ยนแบตเตอรี่ถึงที่ 24 ชั่วโมง", description: "รถสตาร์ทไม่ติด แบตหมด โทร 087-252-7842 บริการทั่วกรุงเทพฯ และปริมณฑล" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="th"><body>{children}</body></html>; }
