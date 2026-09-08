import type { Metadata } from "next";
import ResourcePage from "@/components/admin/ResourcePage";
export function generateMetadata(): Metadata { return { title: "พื้นที่ให้บริการ", description: "จัดการเนื้อหาบริการรายเขต", openGraph: { title: "พื้นที่ให้บริการ", description: "จัดการเนื้อหาบริการรายเขต" } }; }
export default function Page() { return <ResourcePage resource="service-areas" />; }
