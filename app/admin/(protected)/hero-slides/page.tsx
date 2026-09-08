import type { Metadata } from "next";
import ResourcePage from "@/components/admin/ResourcePage";
export function generateMetadata(): Metadata { return { title: "สไลด์หน้าแรก", description: "จัดการภาพ ข้อความ ลิงก์ และลำดับสไลด์", openGraph: { title: "สไลด์หน้าแรก", description: "จัดการภาพ ข้อความ ลิงก์ และลำดับสไลด์" } }; }
export default function Page() { return <ResourcePage resource="hero-slides" />; }
