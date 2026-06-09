import { ImageResponse } from "next/og";
import { bio } from "@/content/bio";
import { OgCard, ogSize, ogContentType } from "@/lib/og-card";

export const alt = `${bio.name} — ${bio.role}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return new ImageResponse(
    <OgCard eyebrow={bio.role} title={bio.tagline} footer={bio.name} />,
    size,
  );
}
