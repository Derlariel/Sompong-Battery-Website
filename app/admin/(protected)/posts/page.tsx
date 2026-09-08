import type { Metadata } from "next";
import ResourcePage from "@/components/admin/ResourcePage";
export function generateMetadata(): Metadata { return { title: "จัดการผลงาน", description: "เพิ่มและแก้ไขผลงานสมปองแบตเตอรี่", openGraph: { title: "จัดการผลงาน", description: "เพิ่มและแก้ไขผลงานสมปองแบตเตอรี่" } }; }
export default function Page() { return <ResourcePage resource="posts" />; }
