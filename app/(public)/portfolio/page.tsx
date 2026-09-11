import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import PortfolioGallery from "@/components/PortfolioGallery";
import { getPortfolioPage } from "@/lib/content";

export const revalidate = 300;
type Props = { searchParams: Promise<{ page?: string | string[] }> };

function pageHref(page: number) {
  return page === 1 ? "/portfolio" : `/portfolio?page=${page}`;
}

function parsePage(value: string | string[] | undefined) {
  return value === undefined ? 1 : typeof value === "string" && /^\d+$/.test(value) ? Number(value) : 0;
}

function paginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const visible = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 4) [2, 3, 4, 5].forEach(page => visible.add(page));
  if (currentPage >= totalPages - 3) [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach(page => visible.add(page));
  const pages = [...visible].filter(page => page > 0 && page <= totalPages).sort((a, b) => a - b);
  return pages.flatMap((page, index) => index > 0 && page - pages[index - 1] > 1 ? [`ellipsis-${page}`, page] : [page]);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePage((await searchParams).page);
  const suffix = page > 1 ? ` หน้า ${page}` : "";
  return {
    title: `ผลงานเปลี่ยนแบตเตอรี่ถึงที่${suffix}`,
    description: "รวมภาพผลงานบริการเปลี่ยนแบตเตอรี่รถยนต์ถึงที่ในกรุงเทพฯ จากสมปองแบตเตอรี่",
    alternates: { canonical: pageHref(Math.max(page, 1)) },
  };
}

export default async function PortfolioPage({ searchParams }: Props) {
  const value = (await searchParams).page;
  const requestedPage = parsePage(value);
  if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) notFound();
  const result = await getPortfolioPage(requestedPage);
  if (requestedPage > result.totalPages) notFound();
  const pages = paginationItems(result.currentPage, result.totalPages);

  return <main id="main" className="section portfolio-page"><div className="container">
    <Link className="back-link" href="/#portfolio"><ArrowLeft size={17} />กลับหน้าแรก</Link>
    <div className="section-heading"><div><p className="eyebrow">จากหน้างานจริง</p><h1>ผลงานของเรา</h1></div><p>ทั้งหมด {result.totalItems} ภาพ<br />หน้า {result.currentPage} จาก {result.totalPages}</p></div>
    <PortfolioGallery photos={result.photos} />
    {result.totalPages > 1 && <nav className="pagination" aria-label="หน้าผลงาน">
      {result.currentPage > 1 && <Link className="pagination-direction" href={pageHref(result.currentPage - 1)} rel="prev"><ChevronLeft size={18} />ก่อนหน้า</Link>}
      <div className="pagination-pages">{pages.map(page => typeof page === "number" ? <Link key={page} href={pageHref(page)} aria-current={page === result.currentPage ? "page" : undefined}>{page}</Link> : <span key={page} aria-hidden="true">…</span>)}</div>
      {result.currentPage < result.totalPages && <Link className="pagination-direction" href={pageHref(result.currentPage + 1)} rel="next">ถัดไป<ChevronRight size={18} /></Link>}
    </nav>}
  </div></main>;
}
