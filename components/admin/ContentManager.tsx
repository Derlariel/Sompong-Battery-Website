"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resourceLabels, type ContentPhoto, type ContentRow } from "@/lib/admin";
import { isImageUrl } from "@/lib/assets";
import { schemas, type Resource } from "@/lib/validation";

type Props = {
  resource: Resource;
  rows: ContentRow[];
  areas: { slug: string; name: string }[];
  posts: { id: string; title: string }[];
};
type Field = { name: string; label: string; type?: "textarea" | "number" | "area" | "post" | "image"; optional?: boolean; hint?: string };

const fields: Record<Resource, Field[]> = {
  posts: [{ name: "title", label: "ชื่อผลงาน" }, { name: "content", label: "รายละเอียด", type: "textarea" }, { name: "areaSlug", label: "พื้นที่ให้บริการ", type: "area", optional: true }],
  photos: [{ name: "url", label: "รูปภาพ", type: "image", hint: "อัปโหลดรูป หรือใส่ /assets/images/portfolio/ชื่อไฟล์.webp หรือ URL จาก Cloudinary" }, { name: "alt", label: "คำอธิบายภาพ", hint: "บรรยายสิ่งที่อยู่ในภาพ เพื่อช่วยผู้ใช้โปรแกรมอ่านหน้าจอ" }, { name: "postId", label: "ผูกกับผลงาน", type: "post", optional: true }],
  "hero-slides": [{ name: "title", label: "หัวข้อสไลด์", type: "textarea", hint: "กด Enter เพื่อขึ้นบรรทัดใหม่" }, { name: "subtitle", label: "ข้อความประกอบ", type: "textarea", optional: true }, { name: "imageUrl", label: "รูปภาพประกอบ", type: "image", optional: true, hint: "เช่น /assets/images/hero/ชื่อไฟล์.webp ต้องเพิ่มไฟล์ก่อนบันทึก" }, { name: "linkUrl", label: "ลิงก์ปุ่ม", hint: "เช่น tel:0872527842, /#services หรือ URL ที่ขึ้นต้นด้วย https://" }, { name: "sortOrder", label: "ลำดับการแสดง", type: "number", hint: "ตัวเลขน้อยแสดงก่อน เปลี่ยนตัวเลขเพื่อจัดเรียงสไลด์" }],
  "service-areas": [{ name: "name", label: "ชื่อเขต" }, { name: "slug", label: "ชื่อใน URL", hint: "ตัวพิมพ์เล็กภาษาอังกฤษ เช่น phra-nakhon การเปลี่ยนค่านี้จะเปลี่ยน URL ของหน้า" }, { name: "description", label: "รายละเอียดบริการในพื้นที่", type: "textarea" }],
  settings: [{ name: "gtmContainerId", label: "GTM Container ID", optional: true, hint: "เช่น GTM-XXXXXXX" }, { name: "googleAdsConvId", label: "Google Ads Conversion ID", optional: true, hint: "เช่น AW-123456789" }, { name: "googleAdsConvLabel", label: "Conversion Label สำหรับปุ่มโทร", optional: true }, { name: "lineConvLabel", label: "Conversion Label สำหรับปุ่ม LINE", optional: true }],
};
const blank: Record<Resource, ContentRow> = {
  posts: { id: "", title: "", content: "", areaSlug: "", photos: [] },
  photos: { id: "", url: "", alt: "", postId: "" },
  "hero-slides": { id: "", title: "", subtitle: "", imageUrl: "", linkUrl: "tel:0872527842", sortOrder: 0 },
  "service-areas": { id: "", name: "", slug: "", description: "" },
  settings: { id: "singleton", gtmContainerId: "", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" },
};

function cloneRow(row: ContentRow) {
  return { ...row, photos: row.photos?.map(photo => ({ ...photo })) };
}

function rowLabel(row: ContentRow) {
  for (const key of ["title", "name", "alt"]) {
    if (typeof row[key] === "string" && row[key]) return row[key];
  }
  return "รายการ";
}

export default function ContentManager({ resource, rows, areas, posts }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<ContentRow | null>(resource === "settings" && rows[0] ? cloneRow(rows[0]) : null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<ContentRow | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const draftPhotos = draft?.photos ?? [];

  function update(name: string, value: string) {
    setDraft(previous => previous ? { ...previous, [name]: value } : null);
  }

  function updatePostPhoto(index: number, key: "url" | "alt", value: string) {
    setDraft(previous => {
      if (!previous) return null;
      const photos = [...(previous.photos ?? [])];
      photos[index] = { ...photos[index], [key]: value };
      return { ...previous, photos };
    });
  }

  function addPostPhoto(photo: ContentPhoto = { url: "", alt: "" }) {
    setDraft(previous => {
      if (!previous || (previous.photos?.length ?? 0) >= 20) return previous;
      return { ...previous, photos: [...(previous.photos ?? []), photo] };
    });
  }

  function removePostPhoto(index: number) {
    setDraft(previous => previous ? { ...previous, photos: (previous.photos ?? []).filter((_, photoIndex) => photoIndex !== index) } : null);
  }

  async function uploadFile(file: File) {
    if (file.size > 3 * 1024 * 1024) throw new Error(`รูป ${file.name} มีขนาดเกิน 3 MB`);
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: data });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return String(result.url);
  }

  async function upload(file: File | undefined, field: string) {
    if (!file) return;
    setError(""); setUploading(true);
    try { update(field, await uploadFile(file)); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "อัปโหลดไม่สำเร็จ"); }
    finally { setUploading(false); }
  }

  async function uploadPostPhotos(files: FileList | null) {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;
    if (draftPhotos.length + selected.length > 20) { setError("เพิ่มรูปได้ไม่เกิน 20 รูปต่อผลงาน"); return; }
    setError(""); setUploading(true);
    try {
      const urls = await Promise.all(selected.map(uploadFile));
      setDraft(previous => previous ? { ...previous, photos: [...(previous.photos ?? []), ...urls.map(url => ({ url, alt: "" }))] } : null);
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "อัปโหลดไม่สำเร็จ"); }
    finally { setUploading(false); }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const parsed = schemas[resource].safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues.map(issue => `${issue.path[0] === "photos" ? "รูปภาพผลงาน" : fields[resource].find(field => field.name === issue.path[0])?.label ?? "ข้อมูล"}: ${issue.message}`).join(" · "));
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${resource}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, id: draft?.id || undefined }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage("บันทึกเรียบร้อยแล้ว");
      if (resource !== "settings") setDraft(null);
      router.refresh();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!deleting) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/${resource}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleting.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage("ลบข้อมูลเรียบร้อยแล้ว"); router.refresh();
    } catch (removeError) { setError(removeError instanceof Error ? removeError.message : "ลบไม่สำเร็จ"); }
    finally { setBusy(false); setDeleting(null); dialog.current?.close(); }
  }

  return <>
    <div className="admin-heading"><div><p className="eyebrow">จัดการเว็บไซต์</p><h1>{resourceLabels[resource]}</h1>{resource !== "settings" && <p>ทั้งหมด {rows.length} รายการ</p>}</div>{resource !== "settings" && !draft && <Button onClick={() => { setDraft(cloneRow(blank[resource])); setError(""); setMessage(""); }}><Plus size={18} />เพิ่มรายการ</Button>}</div>
    {resource === "settings" && <div className="notice">หากใช้ GTM ให้ตั้งค่าแท็ก Google Ads Conversion ใน GTM โดยใช้เหตุการณ์ conversion และตัวแปร conversion_id, conversion_label, contact_channel (call หรือ line) หากเว้น GTM ว่าง ระบบจะส่ง conversion ผ่าน gtag โดยตรงตาม ID และ Label ที่กรอก ดูขั้นตอนใน SETUP.md</div>}
    {message && <div className="notice" role="status">{message}</div>}{error && <div className="notice notice-error" role="alert">{error}</div>}
    {draft && <form onSubmit={save} className="admin-editor">
      <h2 style={{ fontSize: "1.3rem" }}>{resource === "settings" ? "การติดตามการติดต่อ" : draft.id ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}</h2>
      {fields[resource].map(field => <div key={field.name}><label className="form-field">{field.label}{field.optional ? " (ไม่บังคับ)" : " *"}
        {field.type === "textarea" ? <textarea value={String(draft[field.name] ?? "")} onChange={event => update(field.name, event.target.value)} required={!field.optional} disabled={busy || uploading} />
          : field.type === "area" || field.type === "post" ? <select value={String(draft[field.name] ?? "")} onChange={event => update(field.name, event.target.value)} disabled={busy || uploading}><option value="">ไม่ระบุ</option>{(field.type === "area" ? areas.map(area => ({ value: area.slug, label: area.name })) : posts.map(post => ({ value: post.id, label: post.title }))).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          : <input type={field.type === "number" ? "number" : "text"} min={field.type === "number" ? 0 : undefined} max={field.type === "number" ? 9999 : undefined} value={String(draft[field.name] ?? "")} onChange={event => update(field.name, event.target.value)} required={!field.optional} disabled={busy || uploading} />}
        {field.hint && <small>{field.hint}</small>}
      </label>{field.type === "image" && <><label className="form-field"><span><Upload size={16} className="inline-icon" />{uploading ? "กำลังอัปโหลด…" : "อัปโหลด JPG, PNG หรือ WebP (ไม่เกิน 3 MB)"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || uploading} onChange={event => upload(event.target.files?.[0], field.name)} /></label>{typeof draft[field.name] === "string" && isImageUrl(String(draft[field.name])) && <Image className="upload-preview" src={String(draft[field.name])} width={320} height={200} sizes="320px" loading="lazy" alt="ตัวอย่างรูปภาพที่เลือก" />}</>}</div>)}

      {resource === "posts" && <fieldset className="post-photo-editor" disabled={busy || uploading}>
        <div className="post-photo-heading"><div><legend>รูปภาพผลงาน</legend><p>เพิ่มได้สูงสุด 20 รูป ใส่คำอธิบายทุกภาพก่อนบันทึก</p></div><span>{draftPhotos.length}/20 รูป</span></div>
        <div className="post-photo-actions"><label className="btn btn-outline"><Upload size={17} />{uploading ? "กำลังอัปโหลด…" : "อัปโหลดหลายรูป"}<input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={event => { void uploadPostPhotos(event.target.files); event.currentTarget.value = ""; }} /></label><Button type="button" variant="outline" onClick={() => addPostPhoto()} disabled={draftPhotos.length >= 20}><ImagePlus size={17} />เพิ่ม URL รูป</Button></div>
        {draftPhotos.length > 0 && <div className="post-photo-list">{draftPhotos.map((photo, index) => <div className="post-photo-item" key={photo.id ?? `new-photo-${index}`}>
          <div className="post-photo-preview">{isImageUrl(photo.url) ? <Image src={photo.url} alt="" fill sizes="(max-width: 760px) 100vw, 220px" loading="lazy" /> : <ImagePlus aria-hidden="true" />}</div>
          <div className="post-photo-fields"><label className="form-field">URL หรือ path รูปภาพ *<input value={photo.url} onChange={event => updatePostPhoto(index, "url", event.target.value)} placeholder="/assets/images/portfolio/example.webp" required /></label><label className="form-field">คำอธิบายภาพ (Alt text) *<input value={photo.alt} onChange={event => updatePostPhoto(index, "alt", event.target.value)} placeholder="เช่น ช่างกำลังเปลี่ยนแบตเตอรี่รถยนต์ที่เขตบางนา" required maxLength={300} /></label></div>
          <Button type="button" variant="outline" className="post-photo-remove" onClick={() => removePostPhoto(index)} aria-label={`นำรูปที่ ${index + 1} ออกจากผลงาน`}><X size={17} /></Button>
        </div>)}</div>}
      </fieldset>}

      <div className="form-actions"><Button disabled={busy || uploading} type="submit">{busy ? "กำลังบันทึก…" : "บันทึกข้อมูล"}</Button>{resource !== "settings" && <Button variant="outline" type="button" disabled={busy || uploading} onClick={() => { setDraft(null); setError(""); }}>ยกเลิก</Button>}</div>
    </form>}

    {resource !== "settings" && <div className="admin-table-wrap">{rows.length ? <table className="admin-table"><thead><tr><th scope="col">{resource === "photos" ? "รูปภาพ / คำอธิบาย" : "ชื่อรายการ"}</th>{resource === "hero-slides" && <th scope="col">ลำดับ</th>}<th scope="col" style={{ textAlign: "right" }}>จัดการ</th></tr></thead><tbody>{rows.map(row => {
      const firstPhoto = resource === "posts" ? row.photos?.[0] : undefined;
      return <tr key={row.id}><td className="row-title"><div className="admin-row-summary">{resource === "photos" && typeof row.url === "string" && typeof row.alt === "string" && <Image src={row.url} width={100} height={65} sizes="100px" loading="lazy" alt={row.alt} />}{firstPhoto && <Image src={firstPhoto.url} width={100} height={65} sizes="100px" loading="lazy" alt={firstPhoto.alt} />}<div><span>{rowLabel(row)}</span>{resource === "posts" && <p className="muted">{row.photos?.length ?? 0} รูปภาพ</p>}{typeof row.slug === "string" && row.slug && <p className="muted">/service-area/{row.slug}</p>}</div></div></td>{resource === "hero-slides" && <td>{String(row.sortOrder ?? "")}</td>}<td><div className="table-actions"><Button variant="outline" disabled={busy || uploading} onClick={() => { setDraft(cloneRow(row)); setError(""); setMessage(""); window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }}><Pencil size={14} />แก้ไข</Button><Button variant="outline" disabled={busy || uploading} onClick={() => { setDeleting(row); dialog.current?.showModal(); }} aria-label={`ลบ ${rowLabel(row)}`}><Trash2 size={14} /></Button></div></td></tr>;
    })}</tbody></table> : <div className="admin-table-empty">ยังไม่มีข้อมูล เริ่มต้นด้วยปุ่ม “เพิ่มรายการ”</div>}</div>}
    <dialog ref={dialog} className="confirm-dialog" aria-labelledby="delete-title" onCancel={() => setDeleting(null)}><h2 id="delete-title" style={{ fontSize: "1.5rem" }}>ยืนยันการลบข้อมูล</h2><p>ต้องการลบ “{deleting ? rowLabel(deleting) : "รายการนี้"}” หรือไม่?</p>{resource === "photos" && <p className="muted">ลบรูปออกจากเว็บไซต์ ไฟล์ต้นฉบับยังอยู่ใน Cloudinary</p>}{resource === "posts" && <p className="muted">รูปภาพที่เกี่ยวข้องจะยังอยู่ในคลังรูปภาพ</p>}<div className="form-actions"><Button variant="outline" disabled={busy} onClick={() => { dialog.current?.close(); setDeleting(null); }}>ยกเลิก</Button><Button variant="destructive" disabled={busy} onClick={remove}>{busy ? "กำลังลบ…" : "ลบข้อมูล"}</Button></div></dialog>
  </>;
}
