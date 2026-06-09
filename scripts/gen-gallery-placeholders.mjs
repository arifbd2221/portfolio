// Generates gradient placeholder PNGs for the gallery (no external deps).
// Run: node scripts/gen-gallery-placeholders.mjs
// These are throwaway placeholders — replace public/images/gallery/*.png with
// real photos (keep the same filenames, or update src/content/gallery.ts).
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/images/gallery");
mkdirSync(OUT, { recursive: true });

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function pngFromRGB(width, height, rgb) {
  const stride = width * 3;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 2; // "Up" filter — vertical gradients compress tiny
    for (let x = 0; x < stride; x++) {
      const cur = rgb[y * stride + x];
      const up = y === 0 ? 0 : rgb[(y - 1) * stride + x];
      raw[y * (stride + 1) + 1 + x] = (cur - up) & 0xff;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const idat = deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// HSL (h 0-360, s/l 0-1) → [r,g,b] 0-255
function hsl(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function gradient(width, height, hue) {
  const rgb = Buffer.alloc(width * height * 3);
  const top = hsl(hue, 0.55, 0.62);
  const bottom = hsl((hue + 35) % 360, 0.5, 0.22);
  for (let y = 0; y < height; y++) {
    const t = y / (height - 1);
    for (let x = 0; x < width; x++) {
      const tx = (x / (width - 1)) * 0.12; // subtle horizontal tint
      const i = (y * width + x) * 3;
      for (let ch = 0; ch < 3; ch++) {
        rgb[i + ch] = Math.round(top[ch] * (1 - t - tx) + bottom[ch] * (t + tx)) & 0xff;
      }
    }
  }
  return rgb;
}

const specs = [
  { name: "photo-1", w: 1200, h: 800, hue: 280 },
  { name: "photo-2", w: 800, h: 1100, hue: 210 },
  { name: "photo-3", w: 1200, h: 800, hue: 330 },
  { name: "photo-4", w: 900, h: 1200, hue: 170 },
  { name: "photo-5", w: 1200, h: 800, hue: 35 },
  { name: "photo-6", w: 1100, h: 1100, hue: 255 },
];

for (const s of specs) {
  const png = pngFromRGB(s.w, s.h, gradient(s.w, s.h, s.hue));
  writeFileSync(join(OUT, `${s.name}.png`), png);
  console.log(`${s.name}.png  ${s.w}x${s.h}  ${(png.length / 1024).toFixed(1)} KB`);
}
