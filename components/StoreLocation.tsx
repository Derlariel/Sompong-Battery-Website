import { ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const storeName = "สมปองเปลี่ยนแบตเตอรี่นอกสถานที่ด่วน จั๊มแบตรถยนต์";
const storeAddress = "188/106 หมู่บ้าน 84 แมนชั่น ซ.ประดิษฐ์มนูธรรม 3 ถ.ประดิษฐ์มนูธรรม แขวงวังทองหลาง เขตวังทองหลาง กรุงเทพมหานคร 10310";
const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${storeName}, ${storeAddress}`)}`;
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${storeName} ${storeAddress}`)}&output=embed`;

export default function StoreLocation() {
  return <section id="location" className="section location-section">
    <div className="container location-grid">
      <div className="location-details">
        <p className="eyebrow"><MapPin size={16} />ที่ตั้งหน้าร้าน</p>
        <h2>ที่ตั้งของเรา</h2>
        <h3>{storeName}</h3>
        <address>{storeAddress}</address>
        <p className="location-service-note">ต้องการบริการถึงที่ โทรหรือส่งพิกัดทาง LINE ได้ตลอด 24 ชั่วโมง</p>
        <Button asChild>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            นำทางไปหน้าร้าน <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </Button>
      </div>
      <div className="location-map">
        <iframe
          src={mapEmbedUrl}
          title={`แผนที่ ${storeName}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          suppressHydrationWarning
        />
      </div>
    </div>
  </section>;
}
