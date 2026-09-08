"use client";
import { createContext, useContext } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { contact } from "@/lib/defaults";
import { trackContact, type TrackingConfig } from "@/lib/gtag";

const TrackingContext = createContext<TrackingConfig>({ gtmContainerId: "", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" });
export function TrackingProvider({ config, children }: { config: TrackingConfig; children: React.ReactNode }) {
  return <TrackingContext.Provider value={config}>{children}</TrackingContext.Provider>;
}
export function ContactLink({ channel, children, className }: { channel: "call" | "line"; children?: React.ReactNode; className?: string }) {
  const config = useContext(TrackingContext);
  return <Button asChild variant={channel === "call" ? "default" : "secondary"} className={className}>
    <a href={contact[channel === "call" ? "tel" : "line"]} onClick={() => trackContact(channel, config)}>
      {channel === "call" ? <Phone size={19} /> : <MessageCircle size={20} />}
      {children ?? (channel === "call" ? contact.phone : "แชต LINE")}
    </a>
  </Button>;
}
export default function ContactCTA({ sticky = false }: { sticky?: boolean }) {
  return <div className={sticky ? "mobile-contact" : "contact-actions"}><ContactLink channel="call" /><ContactLink channel="line">{sticky ? <span>แชต LINE<small className="contact-id">sompong7842</small></span> : "แชต LINE"}</ContactLink></div>;
}
