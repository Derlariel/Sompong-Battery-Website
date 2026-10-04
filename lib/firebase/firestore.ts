import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firestore } from "./admin";
import type { Area, ClickEvent, HeroSlide, Photo, Post, SiteSettings } from "./types";

function date(value: unknown) {
  return value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : new Date(String(value));
}

function area(id: string, data: FirebaseFirestore.DocumentData): Area {
  return { id, slug: String(data.slug ?? id), name: String(data.name ?? ""), description: String(data.description ?? "") };
}

function photo(id: string, data: FirebaseFirestore.DocumentData): Photo {
  return { id, url: String(data.url ?? ""), alt: String(data.alt ?? ""), publicId: data.publicId ? String(data.publicId) : null, postId: data.postId ? String(data.postId) : null, createdAt: date(data.createdAt) };
}

function slide(id: string, data: FirebaseFirestore.DocumentData): HeroSlide {
  return { id, imageUrl: String(data.imageUrl ?? ""), title: String(data.title ?? ""), subtitle: String(data.subtitle ?? ""), linkUrl: String(data.linkUrl ?? ""), sortOrder: Number(data.sortOrder ?? 0) };
}

function chunks<T>(values: T[], size = 30) {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) => values.slice(index * size, (index + 1) * size));
}

async function photosForPosts(postIds: string[]) {
  if (!postIds.length) return new Map<string, Photo[]>();
  const snapshots = await Promise.all(chunks(postIds).map(ids => firestore().collection("photos").where("postId", "in", ids).get()));
  const result = new Map<string, Photo[]>();
  for (const document of snapshots.flatMap(snapshot => snapshot.docs)) {
    const value = photo(document.id, document.data());
    if (!value.postId) continue;
    result.set(value.postId, [...(result.get(value.postId) ?? []), value]);
  }
  for (const values of result.values()) values.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return result;
}

async function hydratePosts(documents: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const raw: Array<{ id: string } & FirebaseFirestore.DocumentData> = documents.map(document => ({ id: document.id, ...document.data() }));
  const areaSlugs = [...new Set(raw.flatMap(item => item.areaSlug ? [String(item.areaSlug)] : []))];
  const [postPhotos, areaDocuments] = await Promise.all([
    photosForPosts(raw.map(item => item.id)),
    Promise.all(areaSlugs.map(slug => firestore().collection("serviceAreas").doc(slug).get())),
  ]);
  const areas = new Map(areaDocuments.filter(document => document.exists).map(document => [document.id, area(document.id, document.data()!)]));
  return raw.map(item => ({
    id: item.id,
    title: String(item.title ?? ""),
    content: String(item.content ?? ""),
    areaSlug: item.areaSlug ? String(item.areaSlug) : null,
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
    photos: postPhotos.get(item.id) ?? [],
    area: item.areaSlug ? areas.get(String(item.areaSlug)) ?? null : null,
  } satisfies Post));
}

export async function firestoreAreas() {
  const snapshot = await firestore().collection("serviceAreas").get();
  return snapshot.docs.map(document => area(document.id, document.data())).sort((a, b) => a.name.localeCompare(b.name, "th"));
}

export async function firestoreSlides() {
  const snapshot = await firestore().collection("heroSlides").orderBy("sortOrder", "asc").get();
  return snapshot.docs.map(document => slide(document.id, document.data()));
}

export async function firestoreSettings(): Promise<SiteSettings | null> {
  const document = await firestore().collection("siteSettings").doc("main").get();
  if (!document.exists) return null;
  const data = document.data()!;
  return { id: "main", gtmContainerId: String(data.gtmContainerId ?? ""), googleAdsConvId: String(data.googleAdsConvId ?? ""), googleAdsConvLabel: String(data.googleAdsConvLabel ?? ""), lineConvLabel: String(data.lineConvLabel ?? "") };
}

export async function firestorePosts(options: { limit?: number; areaSlug?: string } = {}) {
  let query: FirebaseFirestore.Query = firestore().collection("posts");
  if (options.areaSlug) query = query.where("areaSlug", "==", options.areaSlug);
  query = query.orderBy("createdAt", "desc");
  if (options.limit) query = query.limit(options.limit);
  return hydratePosts((await query.get()).docs);
}

export async function firestorePortfolioPage(page: number, pageSize: number, defaultUrls: string[] = []) {
  const collection = firestore().collection("photos");
  const [countSnapshot, photosSnapshot, savedDefaults] = await Promise.all([
    collection.count().get(),
    collection.orderBy("createdAt", "desc").offset((page - 1) * pageSize).limit(pageSize).get(),
    defaultUrls.length ? collection.where("url", "in", defaultUrls.slice(0, 30)).get() : Promise.resolve(null),
  ]);
  const values = photosSnapshot.docs.map(document => photo(document.id, document.data()));
  const postIds = [...new Set(values.flatMap(value => value.postId ? [value.postId] : []))];
  const postDocuments = await Promise.all(postIds.map(id => firestore().collection("posts").doc(id).get()));
  const posts = new Map(postDocuments.filter(document => document.exists).map(document => [document.id, document.data()!]));
  const areaSlugs = [...new Set(postDocuments.flatMap(document => document.data()?.areaSlug ? [String(document.data()!.areaSlug)] : []))];
  const areaDocuments = await Promise.all(areaSlugs.map(slug => firestore().collection("serviceAreas").doc(slug).get()));
  const names = new Map(areaDocuments.filter(document => document.exists).map(document => [document.id, String(document.data()!.name)]));
  return {
    count: countSnapshot.data().count,
    savedDefaultUrls: savedDefaults?.docs.map(document => String(document.data().url)) ?? [],
    photos: values.map(value => ({ ...value, postTitle: value.postId ? String(posts.get(value.postId)?.title ?? "") || undefined : undefined, areaName: value.postId ? names.get(String(posts.get(value.postId)?.areaSlug)) : undefined })),
  };
}

export async function firestoreAdminResource(resource: string) {
  if (resource === "settings") return [(await firestoreSettings()) ?? { id: "main", gtmContainerId: "", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" }];
  if (resource === "posts") return (await firestorePosts()).map(({ id, title, content, areaSlug, photos }) => ({ id, title, content, areaSlug, photos: photos.map(({ id: photoId, url, alt }) => ({ id: photoId, url, alt })) }));
  if (resource === "service-areas") return firestoreAreas();
  if (resource === "hero-slides") return firestoreSlides();
  if (resource === "photos") {
    const snapshot = await firestore().collection("photos").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(document => { const value = photo(document.id, document.data()); return { id: value.id, url: value.url, alt: value.alt, postId: value.postId }; });
  }
  throw new Error("Unknown resource");
}

type Mutation = { id?: string; [key: string]: unknown };

export async function deleteFirestoreResource(resource: string, id: string) {
  const db = firestore();
  const names: Record<string, string> = { posts: "posts", photos: "photos", "hero-slides": "heroSlides", "service-areas": "serviceAreas" };
  const collectionName = names[resource];
  if (!collectionName) throw new Error("Unknown resource");
  if (resource === "posts") {
    const attached = await db.collection("photos").where("postId", "==", id).get();
    const writer = db.bulkWriter();
    attached.docs.forEach(document => writer.update(document.ref, { postId: null }));
    writer.delete(db.collection("posts").doc(id));
    await writer.close();
    return;
  }
  if (resource === "service-areas") {
    const related = await db.collection("posts").where("areaSlug", "==", id).get();
    const writer = db.bulkWriter();
    related.docs.forEach(document => writer.update(document.ref, { areaSlug: null, updatedAt: FieldValue.serverTimestamp() }));
    writer.delete(db.collection("serviceAreas").doc(id));
    await writer.close();
    return;
  }
  await db.collection(collectionName).doc(id).delete();
}

export async function saveFirestoreResource(resource: string, input: Mutation) {
  const db = firestore();
  const id = typeof input.id === "string" && input.id ? input.id : undefined;
  if (resource === "settings") {
    const { id: _id, ...data } = input;
    void _id;
    await db.collection("siteSettings").doc("main").set(data, { merge: false });
    return "main";
  }
  if (resource === "posts") {
    const { id: _id, photos = [], ...data } = input;
    void _id;
    const reference = id ? db.collection("posts").doc(id) : db.collection("posts").doc();
    const now = FieldValue.serverTimestamp();
    await reference.set({ ...data, updatedAt: now, ...(id ? {} : { createdAt: now }) }, { merge: Boolean(id) });
    const existing = await db.collection("photos").where("postId", "==", reference.id).get();
    const keep = new Set((photos as Array<{ id?: string }>).flatMap(item => item.id ? [item.id] : []));
    const writer = db.bulkWriter();
    existing.docs.filter(document => !keep.has(document.id)).forEach(document => writer.delete(document.ref));
    for (const item of photos as Array<{ id?: string; url: string; alt: string }>) {
      const photoReference = item.id ? db.collection("photos").doc(item.id) : db.collection("photos").doc();
      writer.set(photoReference, { url: item.url, alt: item.alt, postId: reference.id, ...(item.id ? {} : { createdAt: now }) }, { merge: Boolean(item.id) });
    }
    await writer.close();
    return reference.id;
  }
  if (resource === "service-areas") {
    const { id: oldId, slug, ...data } = input;
    const newId = String(slug);
    if (oldId && oldId !== newId) {
      const [existing, related] = await Promise.all([db.collection("serviceAreas").doc(newId).get(), db.collection("posts").where("areaSlug", "==", oldId).get()]);
      if (existing.exists) throw new Error("ALREADY_EXISTS");
      const writer = db.bulkWriter();
      writer.set(db.collection("serviceAreas").doc(newId), { slug: newId, ...data });
      related.docs.forEach(document => writer.update(document.ref, { areaSlug: newId, updatedAt: FieldValue.serverTimestamp() }));
      writer.delete(db.collection("serviceAreas").doc(oldId));
      await writer.close();
    } else if (oldId) await db.collection("serviceAreas").doc(newId).set({ slug: newId, ...data }, { merge: true });
    else {
      try { await db.collection("serviceAreas").doc(newId).create({ slug: newId, ...data }); }
      catch (error) {
        if (error instanceof Error && ("code" in error && error.code === 6 || error.message.includes("ALREADY_EXISTS"))) throw new Error("ALREADY_EXISTS");
        throw error;
      }
    }
    return newId;
  }
  const names: Record<string, string> = { photos: "photos", "hero-slides": "heroSlides" };
  const reference = id ? db.collection(names[resource]).doc(id) : db.collection(names[resource]).doc();
  const { id: _id, ...data } = input;
  void _id;
  await reference.set({ ...data, ...(resource === "photos" && !id ? { createdAt: FieldValue.serverTimestamp() } : {}) }, { merge: Boolean(id) });
  return reference.id;
}

export async function writeClickEvent(input: Omit<ClickEvent, "id" | "createdAt">) {
  await firestore().collection("clickEvents").add({ ...input, createdAt: FieldValue.serverTimestamp() });
}

export async function writeVisitEvent(path: string) {
  await firestore().collection("visitEvents").add({ path, createdAt: FieldValue.serverTimestamp() });
}

export async function firestoreVisitStats(periods: { today: Date; week: Date; month: Date }) {
  const collection = firestore().collection("visitEvents");
  const [daily, weekly, monthly, total] = await Promise.all([
    collection.where("createdAt", ">=", periods.today).count().get(), collection.where("createdAt", ">=", periods.week).count().get(),
    collection.where("createdAt", ">=", periods.month).count().get(), collection.count().get(),
  ]);
  return { daily: daily.data().count, weekly: weekly.data().count, monthly: monthly.data().count, total: total.data().count };
}

export async function firestoreDashboard(since: Date) {
  const db = firestore();
  const clicks = db.collection("clickEvents");
  const [period, recent, total, calls, lines, posts, photos, slides, areas] = await Promise.all([
    clicks.where("createdAt", ">=", since).orderBy("createdAt", "desc").get(), clicks.orderBy("createdAt", "desc").limit(8).get(),
    clicks.count().get(), clicks.where("type", "==", "CALL_CLICK").count().get(), clicks.where("type", "==", "LINE_CLICK").count().get(),
    db.collection("posts").count().get(), db.collection("photos").count().get(), db.collection("heroSlides").count().get(), db.collection("serviceAreas").count().get(),
  ]);
  const convert = (document: FirebaseFirestore.QueryDocumentSnapshot): ClickEvent => {
    const data = document.data();
    const channel = data.channel === "line" || data.type === "LINE_CLICK" ? "line" : "call";
    return { id: document.id, type: channel === "call" ? "CALL_CLICK" : "LINE_CLICK", channel, page: String(data.page ?? data.path ?? "/"), path: String(data.path ?? data.page ?? "/"), areaSlug: data.areaSlug, utmSource: data.utmSource, utmMedium: data.utmMedium, utmCampaign: data.utmCampaign, createdAt: date(data.createdAt) };
  };
  return { periodClicks: period.docs.map(convert), recentClicks: recent.docs.map(convert), totals: { total: total.data().count, call: calls.data().count, line: lines.data().count }, contentCounts: [posts, photos, slides, areas].map(value => value.data().count) };
}
