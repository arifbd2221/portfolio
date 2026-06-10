/** Client-safe media constants (the fs-touching IO lives in media.ts). */

export const MEDIA_FOLDERS = [
  "gallery",
  "projects",
  "story",
  "blog",
  "misc",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
