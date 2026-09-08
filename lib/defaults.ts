export const contact = { phone: "087-252-7842", tel: "tel:0872527842", line: "https://line.me/ti/p/~sompong7842" };

const districts = [
  ["phra-nakhon", "พระนคร"], ["dusit", "ดุสิต"], ["nong-chok", "หนองจอก"],
  ["bang-rak", "บางรัก"], ["bang-khen", "บางเขน"], ["bang-kapi", "บางกะปิ"],
  ["pathum-wan", "ปทุมวัน"], ["pom-prap-sattru-phai", "ป้อมปราบศัตรูพ่าย"],
  ["phra-khanong", "พระโขนง"], ["min-buri", "มีนบุรี"], ["lat-krabang", "ลาดกระบัง"],
  ["yan-nawa", "ยานนาวา"], ["samphanthawong", "สัมพันธวงศ์"], ["phaya-thai", "พญาไท"],
  ["thon-buri", "ธนบุรี"], ["bangkok-yai", "บางกอกใหญ่"], ["huai-khwang", "ห้วยขวาง"],
  ["khlong-san", "คลองสาน"], ["taling-chan", "ตลิ่งชัน"], ["bangkok-noi", "บางกอกน้อย"],
  ["bang-khun-thian", "บางขุนเทียน"], ["phasi-charoen", "ภาษีเจริญ"], ["nong-khaem", "หนองแขม"],
  ["rat-burana", "ราษฎร์บูรณะ"], ["bang-phlat", "บางพลัด"], ["din-daeng", "ดินแดง"],
  ["bueng-kum", "บึงกุ่ม"], ["sathon", "สาทร"], ["bang-sue", "บางซื่อ"], ["chatuchak", "จตุจักร"],
  ["bang-kho-laem", "บางคอแหลม"], ["prawet", "ประเวศ"], ["khlong-toei", "คลองเตย"],
  ["suan-luang", "สวนหลวง"], ["chom-thong", "จอมทอง"], ["don-mueang", "ดอนเมือง"],
  ["ratchathewi", "ราชเทวี"], ["lat-phrao", "ลาดพร้าว"], ["watthana", "วัฒนา"],
  ["bang-khae", "บางแค"], ["lak-si", "หลักสี่"], ["sai-mai", "สายไหม"], ["khan-na-yao", "คันนายาว"],
  ["saphan-sung", "สะพานสูง"], ["wang-thonglang", "วังทองหลาง"], ["khlong-sam-wa", "คลองสามวา"],
  ["bang-na", "บางนา"], ["thawi-watthana", "ทวีวัฒนา"], ["thung-khru", "ทุ่งครุ"], ["bang-bon", "บางบอน"],
] as const;

export const defaultAreas = districts.map(([slug, name]) => ({
  id: slug, slug, name,
  description: `บริการเปลี่ยนแบตเตอรี่รถยนต์นอกสถานที่ในเขต${name} ตลอด 24 ชั่วโมง ไม่เว้นวันหยุด รถสตาร์ทไม่ติด แบตเตอรี่หมด โทรปรึกษาสมพงษ์แบตเตอรี่ได้ทันที ตรวจเช็กและให้คำแนะนำฟรี แจ้งพิกัดเพื่อสอบถามเวลาถึงหน้างาน โดยปกติประมาณ 30 นาที ขึ้นอยู่กับระยะทางและการจราจร รับชำระด้วยเงินสดหรือโอนเงินหลังรับบริการ`,
}));

export const defaultSlides = [
  { id: "welcome", title: "แบตหมด รถสตาร์ทไม่ติด?\nเราพร้อมไปหาคุณ", subtitle: "เปลี่ยนแบตเตอรี่ถึงที่ ทั่วกรุงเทพฯ และปริมณฑล\nพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง", imageUrl: "", linkUrl: contact.tel, sortOrder: 0 },
  { id: "anytime", title: "ดึกแค่ไหน\nก็อุ่นใจได้", subtitle: "ปรึกษาฟรี ตรวจเช็กฟรี ไม่เว้นวันหยุด\nโทรบอกพิกัด แล้วให้เราช่วยดูแล", imageUrl: "", linkUrl: contact.line, sortOrder: 1 },
];

export const defaultSettings = { id: "singleton", gtmContainerId: "", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" };
