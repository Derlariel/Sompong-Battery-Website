export const contact = { phone: "087-252-7842", tel: "tel:0872527842", line: "https://line.me/ti/p/~sompong7842" };

const provinces = [
  ["bangkok", "กรุงเทพ"],
] as const;

const districts = [
  ["phra-nakhon", "พระนคร"], ["dusit", "ดุสิต"], ["nong-chok", "หนองจอก"],
  ["bang-rak", "บางรัก"], ["bang-kapi", "บางกะปิ"],
  ["pathum-wan", "ปทุมวัน"], ["pom-prap-sattru-phai", "ป้อมปราบศัตรูพ่าย"],
  ["phra-khanong", "พระโขนง"], ["min-buri", "มีนบุรี"], ["lat-krabang", "ลาดกระบัง"],
  ["yan-nawa", "ยานนาวา"], ["samphanthawong", "สัมพันธวงศ์"], ["phaya-thai", "พญาไท"],
  ["thon-buri", "ธนบุรี"], ["bangkok-yai", "บางกอกใหญ่"], ["huai-khwang", "ห้วยขวาง"],
  ["khlong-san", "คลองสาน"], ["taling-chan", "ตลิ่งชัน"], ["bangkok-noi", "บางกอกน้อย"],
  ["bang-khun-thian", "บางขุนเทียน"], ["phasi-charoen", "ภาษีเจริญ"],
  ["rat-burana", "ราษฎร์บูรณะ"], ["bang-phlat", "บางพลัด"], ["din-daeng", "ดินแดง"],
  ["bueng-kum", "บึงกุ่ม"], ["sathon", "สาทร"], ["bang-sue", "บางซื่อ"], ["chatuchak", "จตุจักร"],
  ["bang-kho-laem", "บางคอแหลม"], ["prawet", "ประเวศ"], ["khlong-toei", "คลองเตย"],
  ["suan-luang", "สวนหลวง"], ["chom-thong", "จอมทอง"], ["don-mueang", "ดอนเมือง"],
  ["ratchathewi", "ราชเทวี"], ["lat-phrao", "ลาดพร้าว"], ["watthana", "วัฒนา"],
  ["bang-khae", "บางแค"], ["lak-si", "หลักสี่"], ["sai-mai", "สายไหม"], ["khan-na-yao", "คันนายาว"],
  ["saphan-sung", "สะพานสูง"], ["wang-thonglang", "วังทองหลาง"], ["khlong-sam-wa", "คลองสามวา"],
  ["bang-na", "บางนา"], ["bang-bon", "บางบอน"],
] as const;

export const provinceSlugs: ReadonlySet<string> = new Set(provinces.map(([slug]) => slug));

export const defaultAreas = [
  ...provinces.map(([slug, name]) => ({
    id: slug,
    slug,
    name,
    description: `บริการเปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่ใน${name} ตลอด 24 ชั่วโมง ไม่เว้นวันหยุด รถสตาร์ทไม่ติด แบตเตอรี่หมด โทรปรึกษาสมปองแบตเตอรี่ได้ทันที ตรวจเช็กและให้คำแนะนำฟรี แจ้งพิกัดเพื่อสอบถามเวลาถึงหน้างาน โดยปกติประมาณ 30 นาที ขึ้นอยู่กับระยะทางและการจราจร รับชำระด้วยเงินสดหรือโอนเงินหลังรับบริการ`,
  })),
  ...districts.map(([slug, name]) => ({
    id: slug,
    slug,
    name,
    description: `บริการเปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่ในเขต${name} ตลอด 24 ชั่วโมง ไม่เว้นวันหยุด รถสตาร์ทไม่ติด แบตเตอรี่หมด โทรปรึกษาสมปองแบตเตอรี่ได้ทันที ตรวจเช็กและให้คำแนะนำฟรี แจ้งพิกัดเพื่อสอบถามเวลาถึงหน้างาน โดยปกติประมาณ 30 นาที ขึ้นอยู่กับระยะทางและการจราจร รับชำระด้วยเงินสดหรือโอนเงินหลังรับบริการ`,
  })),
];

export const defaultSlides = [
  {
    id: "onsite-check",
    // แถวแรกสีขาว (h1), แถวถัดไปจะได้ class "yellow-text" อัตโนมัติจาก HeroSwiper
    title: "รถสตาร์ทไม่ติด\nเราไปถึงหน้ารถคุณ",
    subtitle: "ตรวจเช็คถึงในห้องเครื่อง ไม่ต้องลากรถเข้าศูนย์",
    imageUrl: "/assets/images/hero/้hero-1-machanic.jpg",
    linkUrl: "https://line.me/ti/p/~sompong7842",
  },
  {
    id: "porsche",
    title: "รถหรูแค่ไหน\nก็ดูแลได้",
    subtitle: "รถหรูแค่ไหนก็ดูแลได้ ทีมงานถึงในสายเดียว",
    imageUrl: "/assets/images/hero/hero-2-machanic.jpg",
    linkUrl: "https://line.me/ti/p/~sompong7842",
  },
  {
    id: "lamborghini",
    title: "กลางคืนแค่ไหน\nก็ไปถึง",
    subtitle: "กลางคืนแค่ไหนก็ไป — สตาร์ทไม่ติดโทรได้ทันที",
    imageUrl: "/assets/images/hero/hero-3-machanic.jpg",
    linkUrl: "tel:0872527842",
  },
];

export const defaultSettings = { id: "singleton", gtmContainerId: "", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" };

const portfolioFiles = [
  ["13421.jpg", 1108, 1477],
  ["16186.jpg", 1108, 1477],
  ["16188.jpg", 1477, 1108],
  ["16721.jpg", 1108, 1477],
  ["16728.jpg", 1108, 1477],
  ["17085.jpg", 1108, 1477],
  ["18391.jpg", 1108, 1477],
  ["18526.jpg", 1108, 1477],
  ["18527.jpg", 1108, 1477],
  ["18553.jpg", 1108, 1477],
  ["25595.jpg", 1108, 1477],
  ["25596.jpg", 1108, 1477],
] as const;

export const defaultPortfolioPhotos = portfolioFiles.map(([file, width, height], index) => ({
  id: `portfolio-${file.replace(".jpg", "")}`,
  url: `/assets/images/portfolio/${file}`,
  alt: `ผลงานบริการเปลี่ยนแบตเตอรี่ถึงที่ ภาพที่ ${index + 1}`,
  width,
  height,
  postId: null,
}));
