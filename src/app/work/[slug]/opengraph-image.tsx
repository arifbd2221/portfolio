import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/content/projects";
import { bio } from "@/content/bio";
import { OgCard, ogSize, ogContentType } from "@/lib/og-card";

export const alt = "Project";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  return new ImageResponse(
    <OgCard
      eyebrow={project ? `${project.role} · ${project.year}` : "Work"}
      title={project?.title ?? "Project"}
      footer={bio.name}
    />,
    size,
  );
}
