export function isLocalImage(value: string) {
  // Reject traversal, URL-encoded separators, queries and script-bearing formats.
  return /^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|avif|gif)$/i.test(value);
}

export function isImageUrl(value: string) {
  if (isLocalImage(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !url.username && !url.password;
  } catch { return false; }
}
