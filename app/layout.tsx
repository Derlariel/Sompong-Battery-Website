import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { TrackingProvider } from "@/components/ContactCTA";
import { getSettings } from "@/lib/content";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "สมปองแบตเตอรี่ | เปลี่ยนแบตเตอรี่ถึงที่ 24 ชั่วโมง", template: "%s | สมปองแบตเตอรี่" },
  description: "บริการเปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่ กรุงเทพฯ และปริมณฑล ตลอด 24 ชั่วโมง โทร 087-252-7842 ปรึกษาฟรี",
  icons: {
    icon: "/assets/icons/sompong-battery-favicon-64.png",
    shortcut: "/assets/icons/sompong-battery-favicon-64.png",
    apple: "/assets/icons/sompong-battery-favicon-64.png",
  },
  openGraph: { locale: "th_TH", type: "website", siteName: "สมปองแบตเตอรี่", title: "สมปองแบตเตอรี่ | เปลี่ยนแบตเตอรี่ถึงที่ 24 ชั่วโมง", description: "รถสตาร์ทไม่ติด แบตหมด โทร 087-252-7842 บริการทั่วกรุงเทพฯ และปริมณฑล" },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return <html lang="th"><body><Analytics config={settings} /><TrackingProvider config={settings}>{children}</TrackingProvider></body></html>;
}
