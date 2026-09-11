"use client";

import { CalendarDays, CalendarRange, Eye, Sigma } from "lucide-react";
import { useEffect, useState } from "react";

type Stats = { daily: number; weekly: number; monthly: number; total: number };

export default function VisitorStats({ footer = false }: { footer?: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetch("/api/analytics/presence", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const items = [
    { label: "เข้าชมวันนี้", value: stats?.daily, icon: Eye, tone: "blue" },
    { label: "เข้าชมสัปดาห์นี้", value: stats?.weekly, icon: CalendarRange, tone: "purple" },
    { label: "เข้าชมเดือนนี้", value: stats?.monthly, icon: CalendarDays, tone: "green" },
    { label: "รวมทั้งหมด", value: stats?.total, icon: Sigma, tone: "orange" },
  ];
  const cards = items.map(({ label, value, icon: Icon, tone }, index) => <article className={footer ? "footer-stat" : `admin-stat${index === 0 ? " admin-stat-live" : ""}`} key={label}>
    <span className={`admin-stat-icon ${tone}`}><Icon size={21} aria-hidden="true" /></span>
    <div><span>{label}</span><strong>{value?.toLocaleString("th-TH") ?? "—"}</strong></div>
    {!footer && index === 0 && <small><i />ข้อมูลล่าสุด</small>}
  </article>);

  if (!footer) return <>{cards}</>;
  return <section className="footer-visitor-stats" aria-label="สถิติผู้เข้าชมเว็บไซต์">
    <div className="footer-stats-heading"><strong>สถิติผู้เข้าชมเว็บไซต์</strong><small><i /> อัปเดตอัตโนมัติ</small></div>
    <div className="footer-stats-grid" aria-live="polite" aria-atomic="true">{cards}</div>
  </section>;
}
