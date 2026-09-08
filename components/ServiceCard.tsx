import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type Props = { icon: LucideIcon; number: string; title: string; text: string };
export default function ServiceCard({ icon: Icon, number, title, text }: Props) {
  return <article className="service-card">
    <div className="service-card-top"><Icon size={30} aria-hidden="true" /><span>{number}</span></div>
    <h3>{title}</h3><p>{text}</p>
    <a href="#services-contact">ติดต่อทีมงาน <ArrowUpRight size={18} aria-hidden="true" /></a>
  </article>;
}
