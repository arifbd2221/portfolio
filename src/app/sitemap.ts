import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { projects } from "@/content/projects";
import { getPublishedPosts } from "@/content/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const routes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  for (const project of projects) {
    routes.push({
      url: `${siteUrl}/work/${project.slug}`,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  for (const post of posts) {
    routes.push({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.metadata.date),
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  return routes;
}
