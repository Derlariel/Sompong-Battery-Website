import { ArrowUpRight } from "lucide-react";
import ContactCTA, { ContactLink } from "./ContactCTA";
import { Button } from "./ui/button";
import { contact } from "@/lib/defaults";

export default function HeroActions({ href }: { href: string }) {
  if (href === contact.line) {
    return <div className="contact-actions"><ContactLink channel="line">ส่งพิกัดทาง LINE</ContactLink><ContactLink channel="call" /></div>;
  }
  if (href === contact.tel) return <ContactCTA />;
  return <div className="hero-actions"><Button asChild><a href={href}>ดูรายละเอียด <ArrowUpRight size={18} /></a></Button><ContactCTA /></div>;
}
