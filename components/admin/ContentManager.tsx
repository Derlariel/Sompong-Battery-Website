"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resourceLabels, type ContentRow } from "@/lib/admin";
import { schemas, type Resource } from "@/lib/validation";

type Props = { resource: Resource; rows: ContentRow[]; areas: { slug: string; name: string }[]; posts: { id: string; title: string }[] };
type Field = { name: string; label: string; type?: "textarea" | "number" | "area" | "post" | "image"; optional?: boolean; hint?: string };
const fields: Record<Resource, Field[]> = {
  posts: [{ name: "title", label: "ชื่อผลงาน" }, { name: "content", label: "รายละเอียด", type: "textarea" }, { name: "areaSlug", label: "พื้นที่ให้บริการ", type: "area", optional: true }],
  photos: [{ name: "url", label: "รูปภาพ", type: "image" }, { name: "alt", label: "คำอธิบายภาพ", hint: "บรรยายสิ่งที่อยู่ในภาพ เพื่อช่วยผู้ใช้โปรแกรมอ่านหน้าจอ" }, { name: "postId", label: "ผูกกับผลงาน", type: "post", optional: true }],
  "hero-slides": [{ name: "title", label: "หัวข้อสไลด์", type: "textarea", hint: "กด Enter เพื่อขึ้นบรรทัดใหม่" }, { name: "subtitle", label: "ข้อความประกอบ", type: "textarea", optional: true }, { name: "imageUrl", label: "รูปภาพประกอบ", type: "image", optional: true }, { name: "linkUrl", label: "ลิงก์ปุ่ม", hint: "เช่น tel:0872527842, /#services หรือ URL ที่ขึ้นต้นด้วย https://" }, { name: "sortOrder", label: "ลำดับการแสดง", type: "number", hint: "ตัวเลขน้อยแสดงก่อน เปลี่ยนตัวเลขเพื่อจัดเรียงสไลด์" }],
  "service-areas": [{ name: "name", label: "ชื่อเขต" }, { name: "slug", label: "ชื่อใน URL", hint: "ตัวพิมพ์เล็กภาษาอังกฤษ เช่น phra-nakhon การเปลี่ยนค่านี้จะเปลี่ยน URL ของหน้า" }, { name: "description", label: "รายละเอียดบริการในพื้นที่", type: "textarea" }],
  settings: [{ name: "gtmContainerId", label: "GTM Container ID", optional: true, hint: "เช่น GTM-XXXXXXX" }, { name: "googleAdsConvId", label: "Google Ads Conversion ID", optional: true, hint: "เช่น AW-123456789" }, { name: "googleAdsConvLabel", label: "Conversion Label สำหรับปุ่มโทร", optional: true }, { name: "lineConvLabel", label: "Conversion Label สำหรับปุ่ม LINE", optional: true }],
};
const blank: Record<Resource, ContentRow> = {
  posts: { id: "", title: "", content: "", areaSlug: "" }, photos: { id: "", url: "", alt: "", postId: "" },
  "hero-slides": { id: "", title: "", subtitle: "", imageUrl: "", linkUrl: "tel:0872527842", sortOrder: 0 },
  "service-areas": { id: "", name: "", slug: "", description: "" },
  settings: { id: "singleton", gtmContainerId: "", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" },
};
export default function ContentManager({ resource, rows, areas, posts }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<ContentRow | null>(resource === "settings" ? rows[0] : null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<ContentRow | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  function update(name: string, value: string) { setDraft(previous => previous ? { ...previous, [name]: value } : null); }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const parsed = schemas[resource].safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues.map(issue => `${fields[resource].find(f => f.name === issue.path[0])?.label ?? "ข้อมูล"}: ${issue.message}`).join(" · ")); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${resource}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, id: draft?.id || undefined }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage("บันทึกเรียบร้อยแล้ว"); if (resource !== "settings") setDraft(null); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/${resource}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleting.id }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setMessage("ลบข้อมูลเรียบร้อยแล้ว"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "ลบไม่สำเร็จ"); }
    finally { setBusy(false); setDeleting(null); dialog.current?.close(); }
  }
  async function upload(file: File | undefined, field: string) {
    if (!file) return;
    setError(""); setUploading(true);
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error("รูปภาพต้องมีขนาดไม่เกิน 3 MB");
      const data = new FormData(); data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      update(field, result.url);
    } catch (error) { setError(error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ"); }
    finally { setUploading(false); }
  }
  return <><div className="admin-heading"><div><p className="eyebrow">จัดการเว็บไซต์</p><h1>{resourceLabels[resource]}</h1>{resource !== "settings" && <p>ทั้งหมด {rows.length} รายการ</p>}</div>{resource !== "settings" && !draft && <Button onClick={() => { setDraft({ ...blank[resource] }); setError(""); setMessage(""); }}><Plus size={18} />เพิ่มรายการ</Button>}</div>
    {resource === "settings" && <div className="notice">หากใช้ GTM ให้ตั้งค่าแท็ก Google Ads Conversion ใน GTM โดยใช้เหตุการณ์ contact_click และ contact_channel (call หรือ line) หากเว้น GTM ว่าง ระบบจะส่ง conversion ผ่าน gtag โดยตรงตาม ID และ Label ที่กรอก ดูขั้นตอนใน SETUP.md</div>}
    {message && <div className="notice" role="status">{message}</div>}{error && <div className="notice notice-error" role="alert">{error}</div>}
    {draft && <form onSubmit={save} className="admin-editor"><h2 style={{ fontSize: "1.3rem" }}>{resource === "settings" ? "การติดตามการติดต่อ" : draft.id ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}</h2>{fields[resource].map(field => <div key={field.name}><label className="form-field">{field.label}{field.optional ? " (ไม่บังคับ)" : " *"}
      {field.type === "textarea" ? <textarea value={String(draft[field.name] ?? "")} onChange={event => update(field.name, event.target.value)} required={!field.optional} disabled={busy || uploading} />
        : field.type === "area" || field.type === "post" ? <select value={String(draft[field.name] ?? "")} onChange={event => update(field.name, event.target.value)} disabled={busy || uploading}><option value="">ไม่ระบุ</option>{(field.type === "area" ? areas.map(area => ({ value: area.slug, label: area.name })) : posts.map(post => ({ value: post.id, label: post.title }))).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        : <input type={field.type === "number" ? "number" : "text"} min={field.type === "number" ? 0 : undefined} max={field.type === "number" ? 9999 : undefined} value={String(draft[field.name] ?? "")} onChange={event => update(field.name, event.target.value)} required={!field.optional} disabled={busy || uploading} />}
      {field.hint && <small>{field.hint}</small>}
    </label>{field.type === "image" && <><label className="form-field"><span><Upload size={16} style={{ display: "inline", marginRight: 6 }} />{uploading ? "กำลังอัปโหลด…" : "อัปโหลด JPG, PNG หรือ WebP (ไม่เกิน 3 MB)"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || uploading} onChange={event => upload(event.target.files?.[0], field.name)} /></label>{typeof draft[field.name] === "string" && String(draft[field.name]).startsWith("https://res.cloudinary.com/") && <Image className="upload-preview" src={String(draft[field.name])} width={320} height={200} alt="ตัวอย่างรูปภาพที่เลือก" />}</>}</div>)}<div className="form-actions"><Button disabled={busy || uploading} type="submit">{busy ? "กำลังบันทึก…" : "บันทึกข้อมูล"}</Button>{resource !== "settings" && <Button variant="outline" type="button" disabled={busy || uploading} onClick={() => { setDraft(null); setError(""); }}>ยกเลิก</Button>}</div></form>}
    {resource !== "settings" && <div className="admin-table-wrap">{rows.length ? <table className="admin-table"><thead><tr><th scope="col">{resource === "photos" ? "รูปภาพ / คำอธิบาย" : "ชื่อรายการ"}</th>{resource === "hero-slides" && <th scope="col">ลำดับ</th>}<th scope="col" style={{ textAlign: "right" }}>จัดการ</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td className="row-title">{resource === "photos" && <Image src={String(row.url)} width={100} height={65} alt={String(row.alt)} />}<span>{row.title || row.name || row.alt}</span>{row.slug && <p className="muted">/service-area/{row.slug}</p>}</td>{resource === "hero-slides" && <td>{row.sortOrder}</td>}<td><div className="table-actions"><Button variant="outline" disabled={busy || uploading} onClick={() => { setDraft({ ...row }); setError(""); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil size={14} />แก้ไข</Button><Button variant="outline" disabled={busy || uploading} onClick={() => { setDeleting(row); dialog.current?.showModal(); }} aria-label={`ลบ ${row.title || row.name || row.alt}`}><Trash2 size={14} /></Button></div></td></tr>)}</tbody></table> : <div className="admin-table-empty">ยังไม่มีข้อมูล เริ่มต้นด้วยปุ่ม “เพิ่มรายการ”</div>}</div>}
    <dialog ref={dialog} className="confirm-dialog" aria-labelledby="delete-title" onCancel={() => setDeleting(null)}><h2 id="delete-title" style={{ fontSize: "1.5rem" }}>ยืนยันการลบข้อมูล</h2><p>ต้องการลบ “{deleting?.title || deleting?.name || deleting?.alt}” หรือไม่?</p>{resource === "photos" && <p className="muted">ลบรูปออกจากเว็บไซต์ ไฟล์ต้นฉบับยังอยู่ใน Cloudinary</p>}{resource === "posts" && <p className="muted">รูปภาพที่เกี่ยวข้องจะยังอยู่ในคลังรูปภาพ</p>}<div className="form-actions"><Button variant="outline" disabled={busy} onClick={() => { dialog.current?.close(); setDeleting(null); }}>ยกเลิก</Button><Button variant="destructive" disabled={busy} onClick={remove}>{busy ? "กำลังลบ…" : "ลบข้อมูล"}</Button></div></dialog>
  </>;
}
