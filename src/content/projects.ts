import { z } from "zod";
import raw from "./projects.json";

/**
 * Projects content — backed by projects.json so the admin can edit it.
 *
 * The `id` field is a STABLE handle — it is the target for the AI chat's
 * focusProject(id) tool and the 3D scene's focus nodes. Never reuse or churn
 * ids once a project ships (the admin enforces id immutability).
 */
const projectLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
});

export const projectSchema = z.object({
  /** Stable, lowercase, kebab-case. AI + 3D scene target this. */
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  /** URL slug for /work/[slug]. */
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)),
  role: z.string().min(1),
  year: z.number().int().min(1990).max(2100),
  links: z.array(projectLinkSchema),
  /** Cover image path under /public. */
  cover: z.string().startsWith("/"),
  /** Long-form case study body (paragraphs split on blank lines). */
  body: z.string(),
});

export const projectsSchema = z
  .array(projectSchema)
  .superRefine((list, ctx) => {
    const ids = new Set<string>();
    const slugs = new Set<string>();
    for (const p of list) {
      if (ids.has(p.id)) {
        ctx.addIssue({ code: "custom", message: `Duplicate project id "${p.id}"` });
      }
      if (slugs.has(p.slug)) {
        ctx.addIssue({ code: "custom", message: `Duplicate project slug "${p.slug}"` });
      }
      ids.add(p.id);
      slugs.add(p.slug);
    }
  });

export type ProjectLink = z.infer<typeof projectLinkSchema>;
export type Project = z.infer<typeof projectSchema>;

export const projects: Project[] = projectsSchema.parse(raw);

/** Lookup by stable id — used by the AI focusProject tool. */
export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** Lookup by URL slug — used by /work/[slug]. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
