import { z } from "zod";
import raw from "./gallery.json";

/**
 * Curated photo gallery — backed by gallery.json so the admin can manage it.
 * Single source of truth for site photography; the Story section can reference
 * these images by id. Static local images only — no pagination, no CDN.
 *
 * width/height/blurDataURL are stored per image (the admin computes them at
 * upload time; `scripts/backfill-image-meta.mjs` covers hand-dropped files),
 * giving next/image the same blur-up UX as static imports without them.
 */
export const galleryImageSchema = z.object({
  /** Stable id, so the Story section can reference a shared photo. */
  id: z.string().regex(/^[a-z0-9-]+$/),
  src: z.string().startsWith("/"),
  alt: z.string().min(1),
  caption: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  // Base64 raster only (PNG/JPEG/WebP) — matches what the admin/backfill
  // generate. Excludes SVG and other data: URIs as input-validation hygiene.
  blurDataURL: z
    .string()
    .regex(
      /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/,
      "must be a base64 PNG/JPEG/WebP data URI",
    ),
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;

export const gallery: GalleryImage[] = z.array(galleryImageSchema).parse(raw);
