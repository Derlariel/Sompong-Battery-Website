import Image from "next/image";
import type { PublicPortfolioPhoto } from "@/lib/content";

export default function PortfolioGallery({ photos }: { photos: PublicPortfolioPhoto[] }) {
  if (!photos.length) return null;

  return (
    <div className="portfolio-gallery" aria-label="แกลเลอรีผลงาน">
      {photos.map((photo, index) => (
        <figure key={photo.id} className={`portfolio-gallery-item${index === 0 ? " portfolio-gallery-featured" : ""}`}>
          <div className="portfolio-gallery-media">
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes={index === 0 ? "(max-width: 760px) 100vw, (max-width: 1100px) 66vw, 50vw" : "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"}
            loading="lazy"
            quality={80}
          />
          </div>
          <figcaption><span>{photo.areaName ? `เขต${photo.areaName}` : "ผลงานหน้างานจริง"}</span>{photo.postTitle && <strong>{photo.postTitle}</strong>}<p>{photo.alt}</p></figcaption>
        </figure>
      ))}
    </div>
  );
}
