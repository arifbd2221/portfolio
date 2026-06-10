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
const galleryImageSchema = z.object({
  /** Stable id, so the Story section can reference a shared photo. */
  id: z.string().regex(/^[a-z0-9-]+$/),
  src: z.string().startsWith("/"),
  alt: z.string().min(1),
  caption: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().startsWith("data:image/"),
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;

export const gallery: GalleryImage[] = z.array(galleryImageSchema).parse(raw);
