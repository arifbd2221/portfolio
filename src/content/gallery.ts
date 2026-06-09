/**
 * Curated photo gallery (Phase 6). PLACEHOLDER entries.
 *
 * This list is the single source of truth for site photography; the Story
 * section reuses these images. Use static local images under
 * /public/images/gallery with explicit width/height (for next/image + blur).
 */

export interface GalleryImage {
  /** Stable id, so the Story section can reference a shared photo. */
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

// TODO: replace with the real curated handful of photos.
export const gallery: GalleryImage[] = [
  {
    id: "photo-1",
    src: "/images/gallery/photo-1.jpg",
    alt: "PLACEHOLDER alt text — describe the photo for screen readers.",
    width: 1600,
    height: 1067,
    caption: "PLACEHOLDER caption",
  },
  {
    id: "photo-2",
    src: "/images/gallery/photo-2.jpg",
    alt: "PLACEHOLDER alt text.",
    width: 1067,
    height: 1600,
  },
  {
    id: "photo-3",
    src: "/images/gallery/photo-3.jpg",
    alt: "PLACEHOLDER alt text.",
    width: 1600,
    height: 1067,
  },
];
