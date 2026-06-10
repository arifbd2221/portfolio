"use client";

/**
 * Client-side image processing for admin uploads:
 * - downscale to a sane max dimension (canvas re-encode also strips EXIF/GPS),
 * - extract width/height,
 * - generate the tiny blurDataURL stored in content JSON.
 */

export interface ProcessedImage {
  fileName: string;
  base64: string;
  width: number;
  height: number;
  blurDataURL: string;
  bytes: number;
}

const MAX_DIM = 2000;

function kebabBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "image"
  );
}

function blurFrom(canvas: HTMLCanvasElement): string {
  const tiny = document.createElement("canvas");
  const scale = 10 / Math.max(canvas.width, canvas.height);
  tiny.width = Math.max(1, Math.round(canvas.width * scale));
  tiny.height = Math.max(1, Math.round(canvas.height * scale));
  tiny.getContext("2d")!.drawImage(canvas, 0, 0, tiny.width, tiny.height);
  return tiny.toDataURL("image/png");
}

export async function processImageFile(file: File): Promise<ProcessedImage> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error("Only JPEG, PNG, or WebP images are supported.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const keepPng = file.type === "image/png";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Image encoding failed."))),
      keepPng ? "image/png" : "image/jpeg",
      0.88,
    ),
  );

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(blob);
  });

  return {
    fileName: `${kebabBaseName(file.name)}.${keepPng ? "png" : "jpg"}`,
    base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
    width,
    height,
    blurDataURL: blurFrom(canvas),
    bytes: blob.size,
  };
}

/**
 * Derive width/height/blurDataURL from an already-hosted image (used when
 * picking an existing media item into the gallery). Same-origin paths and
 * raw.githubusercontent (CORS *) are both canvas-readable.
 */
export async function probeImage(src: string): Promise<{
  width: number;
  height: number;
  blurDataURL: string;
}> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    blurDataURL: blurFrom(canvas),
  };
}
