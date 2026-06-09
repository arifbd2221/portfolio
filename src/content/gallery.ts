import type { StaticImageData } from "next/image";

// Static imports → next/image generates width/height + a real blur placeholder.
// PLACEHOLDER rasters (see scripts/gen-gallery-placeholders.mjs). Replace the
// files in public/images/gallery with real photos (keep filenames or update here).
import photo1 from "../../public/images/gallery/photo-1.png";
import photo2 from "../../public/images/gallery/photo-2.png";
import photo3 from "../../public/images/gallery/photo-3.png";
import photo4 from "../../public/images/gallery/photo-4.png";
import photo5 from "../../public/images/gallery/photo-5.png";
import photo6 from "../../public/images/gallery/photo-6.png";

/**
 * Curated photo gallery (Phase 6). Single source of truth for site photography;
 * the Story section can reference these same images by id so they aren't
 * duplicated. Static local images only — no pagination, no CDN.
 */
export interface GalleryImage {
  /** Stable id, so the Story section can reference a shared photo. */
  id: string;
  image: StaticImageData;
  alt: string;
  caption?: string;
}

// TODO: replace placeholder images + alt/caption with the real curated handful.
export const gallery: GalleryImage[] = [
  { id: "photo-1", image: photo1, alt: "PLACEHOLDER — describe the photo.", caption: "PLACEHOLDER caption" },
  { id: "photo-2", image: photo2, alt: "PLACEHOLDER — describe the photo." },
  { id: "photo-3", image: photo3, alt: "PLACEHOLDER — describe the photo.", caption: "PLACEHOLDER caption" },
  { id: "photo-4", image: photo4, alt: "PLACEHOLDER — describe the photo." },
  { id: "photo-5", image: photo5, alt: "PLACEHOLDER — describe the photo." },
  { id: "photo-6", image: photo6, alt: "PLACEHOLDER — describe the photo.", caption: "PLACEHOLDER caption" },
];
