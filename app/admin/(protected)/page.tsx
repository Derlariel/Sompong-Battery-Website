import Link from "next/link";
import { Activity, ArrowUpRight, FileText, Images, MapPinned, MessageCircleMore, MousePointerClick, PhoneCall, Presentation } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;
const dayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" });
const shortDateFormatter = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short" });
const dateTimeFormatter = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function Dashboard() {
  await requireAdmin();
  const now = new Date();
  const since30Days = new Date(now.getTime() - 29 * DAY);
  const [clicks, recentClicks, contentCounts] = await Promise.all([
    prisma.clickEvent.findMany({ where: { createdAt: { gte: since30Days } }, select: { channel: true, createdAt: true } }),
    prisma.clickEvent.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, channel: true, path: true, createdAt: true } }),
    Promise.all([prisma.post.count(), prisma.photo.count(), prisma.heroSlide.count(), prisma.serviceArea.count()]),
  ]);

  const todayKey = dayFormatter.format(now);
  const callCount = clicks.filter(click => click.channel === "call").length;
  const lineCount = clicks.filter(click => click.channel === "line").length;
  const todayCount = clicks.filter(click => dayFormatter.format(click.createdAt) === todayKey).length;
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now.getTime() - (13 - index) * DAY);
    const key = dayFormatter.format(date);
    return { key, label: shortDateFormatter.format(date), count: clicks.filter(click => dayFormatter.format(click.createdAt) === key).length };
  });
  const maxDaily = Math.max(1, ...days.map(day => day.count));
  const totalClicks = clicks.length;
  const channelTotal = Math.max(1, callCount + lineCount);

  const stats = [
    { label: "คลิกทั้งหมด 30 วัน", value: totalClicks, icon: MousePointerClick, tone: "red" },
    { label: "คลิกวันนี้", value: todayCount, icon: Activity, tone: "blue" },
    { label: "คลิกโทรศัพท์", value: callCount, icon: PhoneCall, tone: "green" },
    { label: "คลิก LINE", value: lineCount, icon: MessageCircleMore, tone: "orange" },
  ];
  const content = [
    { href: "/admin/posts", label: "ผลงาน / บทความ", value: contentCounts[0], icon: FileText },
    { href: "/admin/photos", label: "รูปภาพ", value: contentCounts[1], icon: Images },
    { href: "/admin/hero-slides", label: "สไลด์หน้าแรก", value: contentCounts[2], icon: Presentation },
    { href: "/admin/service-areas", label: "พื้นที่บริการ", value: contentCounts[3], icon: MapPinned },
  ];

  return <>
    <div className="admin-heading dashboard-heading">
      <div><p className="eyebrow">DASHBOARD</p><h1>ภาพรวมเว็บไซต์</h1><p>ติดตามการติดต่อและจัดการเนื้อหาจากที่เดียว</p></div>
      <div className="admin-live"><span />ข้อมูลล่าสุด ณ {dateTimeFormatter.format(now)} น.</div>
    </div>

    <section className="admin-stats" aria-label="สถิติการคลิก 30 วัน">
      {stats.map(({ label, value, icon: Icon, tone }) => <article className="admin-stat" key={label}>
        <span className={`admin-stat-icon ${tone}`}><Icon size={21} /></span>
        <div><span>{label}</span><strong>{value.toLocaleString("th-TH")}</strong></div>
      </article>)}
    </section>

    <div className="dashboard-grid">
      <section className="dashboard-card chart-card">
        <div className="dashboard-card-heading"><div><h2>แนวโน้มการคลิก</h2><p>จำนวนคลิกปุ่มโทรและ LINE ในช่วง 14 วันล่าสุด</p></div><span className="dashboard-period">14 วัน</span></div>
        <div className="click-chart" role="img" aria-label={`กราฟการคลิก 14 วัน รวม ${days.reduce((sum, day) => sum + day.count, 0)} ครั้ง`}>
          {days.map(day => <div className="chart-column" key={day.key} title={`${day.label}: ${day.count} คลิก`}>
            <span className="chart-value">{day.count}</span>
            <div className="chart-track"><span style={{ height: `${day.count ? Math.max(12, day.count / maxDaily * 100) : 3}%` }} /></div>
            <span className="chart-label">{day.label}</span>
          </div>)}
        </div>
      </section>

      <section className="dashboard-card channel-card">
        <div className="dashboard-card-heading"><div><h2>ช่องทางติดต่อ</h2><p>สัดส่วนจาก 30 วันล่าสุด</p></div></div>
        <div className="channel-total"><strong>{totalClicks.toLocaleString("th-TH")}</strong><span>คลิกทั้งหมด</span></div>
        <div className="channel-row"><div><span><PhoneCall size={16} />โทรศัพท์</span><strong>{callCount}</strong></div><div className="channel-track"><span style={{ width: `${callCount / channelTotal * 100}%` }} /></div></div>
        <div className="channel-row line"><div><span><MessageCircleMore size={16} />LINE</span><strong>{lineCount}</strong></div><div className="channel-track"><span style={{ width: `${lineCount / channelTotal * 100}%` }} /></div></div>
      </section>
    </div>

    <div className="dashboard-grid lower-grid">
      <section className="dashboard-card">
        <div className="dashboard-card-heading"><div><h2>คลิกล่าสุด</h2><p>กิจกรรมจากปุ่มติดต่อบนหน้าเว็บไซต์</p></div></div>
        {recentClicks.length ? <div className="recent-clicks">{recentClicks.map(click => <div className="recent-click" key={click.id}>
          <span className={`recent-icon ${click.channel}`} aria-hidden="true">{click.channel === "call" ? <PhoneCall size={16} /> : <MessageCircleMore size={16} />}</span>
          <div><strong>{click.channel === "call" ? "คลิกโทรศัพท์" : "คลิก LINE"}</strong><span>{click.path}</span></div>
          <time dateTime={click.createdAt.toISOString()}>{dateTimeFormatter.format(click.createdAt)} น.</time>
        </div>)}</div> : <div className="dashboard-empty"><MousePointerClick size={26} /><strong>ยังไม่มีข้อมูลการคลิก</strong><span>สถิติจะเริ่มแสดงเมื่อลูกค้ากดปุ่มโทรหรือ LINE</span></div>}
      </section>

      <section className="dashboard-card">
        <div className="dashboard-card-heading"><div><h2>จัดการเนื้อหา</h2><p>ทางลัดไปยังข้อมูลเว็บไซต์</p></div></div>
        <div className="content-overview">{content.map(({ href, label, value, icon: Icon }) => <Link href={href} key={href}><span><Icon size={18} /></span><div><strong>{value.toLocaleString("th-TH")}</strong><small>{label}</small></div><ArrowUpRight size={17} /></Link>)}</div>
      </section>
    </div>
  </>;
}
