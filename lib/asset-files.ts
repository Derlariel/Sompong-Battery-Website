import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { isLocalImage } from "./assets";

export async function localImageExists(value: string) {
  if (!isLocalImage(value)) return false;
  try {
    const file = await stat(path.join(process.cwd(), "public", value.slice(1)));
    return file.isFile();
  } catch { return false; }
}
