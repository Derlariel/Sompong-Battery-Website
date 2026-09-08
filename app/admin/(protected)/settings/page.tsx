import type { Metadata } from "next";
import ResourcePage from "@/components/admin/ResourcePage";
export function generateMetadata(): Metadata { return { title: "ตั้งค่า Google Ads", description: "ตั้งค่าการติดตามปุ่มโทรและ LINE", openGraph: { title: "ตั้งค่า Google Ads", description: "ตั้งค่าการติดตามปุ่มโทรและ LINE" } }; }
export default function Page() { return <ResourcePage resource="settings" />; }
