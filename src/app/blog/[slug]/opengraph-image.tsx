import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/content/posts";
import { bio } from "@/content/bio";
import { OgCard, ogSize, ogContentType } from "@/lib/og-card";

export const alt = "Blog post";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return new ImageResponse(
    <OgCard
      eyebrow="Writing"
      title={post?.metadata.title ?? "Blog"}
      footer={bio.name}
    />,
    size,
  );
}
