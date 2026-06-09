import type { ReactElement } from "react";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Shared layout for dynamic OG images (next/og + Satori). All boxes set an
 * explicit display:flex per Satori's requirement.
 */
export function OgCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer: string;
}): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "80px",
        background: "linear-gradient(135deg, #0e0b1f 0%, #241d4a 55%, #3a2f7a 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#a78bff", letterSpacing: 2 }}>
        {eyebrow}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.1,
          maxWidth: "90%",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", fontSize: 28, opacity: 0.8 }}>
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "#a78bff",
            marginRight: 16,
          }}
        />
        {footer}
      </div>
    </div>
  );
}
