// Backfills width/height/blurDataURL for gallery images into gallery.json.
// Run after replacing photos: node scripts/backfill-image-meta.mjs
// (The admin computes the same metadata at upload time; this script covers
// images dropped into public/images/gallery by hand.)
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GALLERY_JSON = join(ROOT, "src/content/gallery.json");

const entries = JSON.parse(readFileSync(GALLERY_JSON, "utf8"));

for (const entry of entries) {
  const file = join(ROOT, "public", entry.src);
  const image = sharp(file);
  const { width, height } = await image.metadata();
  const tiny = await image
    .resize(10, 10, { fit: "inside" })
    .toFormat("png")
    .toBuffer();
  entry.width = width;
  entry.height = height;
  entry.blurDataURL = `data:image/png;base64,${tiny.toString("base64")}`;
  console.log(`${entry.src}  ${width}x${height}  blur ${tiny.length}b`);
}

writeFileSync(GALLERY_JSON, JSON.stringify(entries, null, 2) + "\n");
console.log(`wrote ${GALLERY_JSON}`);
