import type { Metadata } from "next";
import ResourcePage from "@/components/admin/ResourcePage";
export function generateMetadata(): Metadata { return { title: "คลังรูปภาพ", description: "จัดการรูปภาพผลงานและคำอธิบายภาพ", openGraph: { title: "คลังรูปภาพ", description: "จัดการรูปภาพผลงานและคำอธิบายภาพ" } }; }
export default function Page() { return <ResourcePage resource="photos" />; }
