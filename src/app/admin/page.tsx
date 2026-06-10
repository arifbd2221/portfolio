import Link from "next/link";
import { getAllPosts } from "@/content/posts";
import { projects } from "@/content/projects";
import { gallery } from "@/content/gallery";
import { story } from "@/content/story";

export default async function AdminOverview() {
  const posts = await getAllPosts();
  const cards = [
    {
      href: "/admin/posts",
      label: "Posts",
      count: posts.length,
      hint: "Write and publish blog posts",
    },
    {
      href: "/admin/projects",
      label: "Projects",
      count: projects.length,
      hint: "The work grid + AI focus targets",
    },
    {
      href: "/admin/story",
      label: "Story beats",
      count: story.beats.length,
      hint: "The scrollytelling narrative",
    },
    {
      href: "/admin/gallery",
      label: "Gallery photos",
      count: gallery.length,
      hint: "The curated handful",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 text-sm text-muted">
        Saves commit to GitHub; Vercel redeploys in about a minute. The editors
        arrive phase by phase — Posts first.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-border bg-surface/40 p-5 transition-colors hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <p className="text-3xl font-semibold tracking-tight">{card.count}</p>
            <p className="mt-1 font-medium">{card.label}</p>
            <p className="mt-1 text-xs text-muted">{card.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
