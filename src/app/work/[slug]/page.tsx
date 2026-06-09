import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProjectBySlug } from "@/content/projects";
import { hueFromId } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Prerender a static page per project (Next 16: params is async at the page).
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
    },
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const hue = hueFromId(project.id);
  const paragraphs = project.body.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-24">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        ← Back to work
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          {project.role} · {project.year}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
          {project.summary}
        </p>
      </header>

      <div
        className="mt-10 aspect-[16/7] w-full rounded-2xl border border-border"
        style={{
          background: `radial-gradient(120% 120% at 30% 20%, oklch(0.6 0.2 ${hue}) 0%, oklch(0.4 0.16 ${(hue + 40) % 360}) 50%, oklch(0.2 0.05 ${hue}) 100%)`,
        }}
        aria-hidden="true"
      />

      <ul className="mt-8 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border px-3 py-1 text-sm text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>

      <div className="prose prose-zinc mt-10 max-w-none dark:prose-invert">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {project.links.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
