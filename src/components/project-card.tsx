"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        href={`/work/${project.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-surface/40 transition-colors hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
          <Image
            src={project.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
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
