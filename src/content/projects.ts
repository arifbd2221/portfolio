/**
 * Projects content. PLACEHOLDER data.
 *
 * The `id` field is a STABLE handle — it is the target for the AI chat's
 * focusProject(id) tool (Phase 7) and the 3D scene's focus nodes (Phase 2).
 * Never reuse or churn ids once a project ships.
 */

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  /** Stable, lowercase, kebab-case. AI + 3D scene target this. */
  id: string;
  title: string;
  /** URL slug for /work/[slug]. */
  slug: string;
  /** One-line summary for cards + the chat. */
  summary: string;
  tags: string[];
  role: string;
  year: number;
  links: ProjectLink[];
  /** Cover image path under /public/images (added in Phase 3). */
  cover: string;
  /** Long-form case study body (Markdown-ish string for now). */
  body: string;
}

// TODO: replace with real projects. Keep ids stable.
export const projects: Project[] = [
  {
    id: "aurora",
    title: "Aurora",
    slug: "aurora",
    summary:
      "PLACEHOLDER — a real-time generative visual engine. Replace with a real project.",
    tags: ["WebGL", "Realtime", "TypeScript"],
    role: "Creator",
    year: 2025,
    links: [{ label: "Live", href: "https://example.com" }],
    cover: "/images/projects/aurora.jpg",
    body: "PLACEHOLDER case study body. Problem, approach, outcome.",
  },
  {
    id: "lighthouse",
    title: "Lighthouse",
    slug: "lighthouse",
    summary:
      "PLACEHOLDER — an AI assistant that navigates large codebases. Replace.",
    tags: ["AI", "DX", "Next.js"],
    role: "Lead Engineer",
    year: 2024,
    links: [{ label: "Case study", href: "https://example.com" }],
    cover: "/images/projects/lighthouse.jpg",
    body: "PLACEHOLDER case study body.",
  },
  {
    id: "atlas",
    title: "Atlas",
    slug: "atlas",
    summary:
      "PLACEHOLDER — a data-viz platform for exploring spatial datasets. Replace.",
    tags: ["Data Viz", "Maps", "React"],
    role: "Frontend",
    year: 2023,
    links: [{ label: "Repo", href: "https://github.com/" }],
    cover: "/images/projects/atlas.jpg",
    body: "PLACEHOLDER case study body.",
  },
];

/** Lookup by stable id — used by the AI focusProject tool. */
export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** Lookup by URL slug — used by /work/[slug]. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
