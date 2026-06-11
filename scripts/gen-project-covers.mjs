// Generates branded, project-relevant cover cards (title + tech) as PNGs.
// Run: node scripts/gen-project-covers.mjs
// On-brand placeholders until real screenshots are added via /admin/media.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/images/projects");

const projects = JSON.parse(
  readFileSync(join(ROOT, "src/content/projects.json"), "utf8"),
);

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Big translucent motif per project type.
function glyph(tags) {
  const t = tags.map((x) => x.toLowerCase());
  if (t.some((x) => x.includes("cli"))) return "▸_";
  if (t.some((x) => x.includes("graphql"))) return "◈";
  if (t.some((x) => x.includes("rest") || x.includes("api"))) return "{ }";
  if (t.some((x) => x.includes("test"))) return "✓";
  return "</>";
}

// Wrap a title into <=2 lines around the midpoint.
function wrap(title) {
  if (title.length <= 20) return [title];
  const words = title.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const W = 1200;
const H = 750;

for (const [i, p] of projects.entries()) {
  const hue = 250 + i * 28; // violet → blue spread, on-brand
  const lines = wrap(p.title);
  const titleSize = lines.length > 1 ? 64 : 76;
  const titleSvg = lines
    .map(
      (line, idx) =>
        `<text x="80" y="${330 + idx * (titleSize + 8)}" font-family="Helvetica, Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff">${esc(line)}</text>`,
    )
    .join("");

  const tags = p.tags.slice(0, 4);
  let tx = 80;
  const pills = tags
    .map((tag) => {
      const w = 28 + tag.length * 13;
      const pill = `<g transform="translate(${tx},560)"><rect width="${w}" height="44" rx="22" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.25)"/><text x="${w / 2}" y="29" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">${esc(tag)}</text></g>`;
      tx += w + 16;
      return pill;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue},45%,16%)"/>
      <stop offset="60%" stop-color="hsl(${hue},55%,11%)"/>
      <stop offset="100%" stop-color="hsl(${hue + 15},60%,7%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="22%" r="55%">
      <stop offset="0%" stop-color="hsla(${hue},80%,65%,0.45)"/>
      <stop offset="100%" stop-color="hsla(${hue},80%,65%,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <text x="${W - 70}" y="${H - 70}" font-family="Helvetica, Arial, sans-serif" font-size="320" font-weight="700" fill="rgba(255,255,255,0.06)" text-anchor="end">${esc(glyph(p.tags))}</text>
  <text x="80" y="190" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="3" fill="hsl(${hue},80%,75%)">PROJECT · ${p.year}</text>
  ${titleSvg}
  ${pills}
</svg>`;

  const file = join(OUT, `${p.id}.png`);
  await sharp(Buffer.from(svg)).png().toFile(file);
  console.log(`${p.id}.png  ${lines.join(" / ")}  [${tags.join(", ")}]`);
}
