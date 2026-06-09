"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "@/content/projects";
import { hueFromId } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  const hue = hueFromId(project.id);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        href={`/work/${project.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-surface/40 transition-colors hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {/* Cover placeholder — swap for next/image once /public/images/projects exists. */}
        <div
          className="relative aspect-[16/10] w-full overflow-hidden"
          style={{
            background: `radial-gradient(120% 120% at 30% 20%, oklch(0.6 0.2 ${hue}) 0%, oklch(0.45 0.18 ${(hue + 40) % 360}) 45%, oklch(0.22 0.06 ${hue}) 100%)`,
          }}
        >
          <span className="absolute bottom-3 right-4 font-mono text-6xl font-bold text-white/15 transition-transform duration-500 group-hover:scale-110">
            {project.title.charAt(0)}
          </span>
        </div>

        <div className="p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {project.role} · {project.year}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {project.summary}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </motion.article>
  );
}
