/**
 * Bio / identity content. PLACEHOLDER — swap in real details.
 * Used by the layout metadata, the About section (Phase 3), and assembled into
 * the AI chat's system prompt (Phase 7).
 */

export interface SocialLink {
  /** Display label, e.g. "GitHub". */
  label: string;
  href: string;
}

export interface Bio {
  name: string;
  /** Short role line, e.g. "Software Engineer · AI & Interactive". */
  role: string;
  /** One-line hook for the hero. */
  tagline: string;
  /** A paragraph for About + the AI system prompt. */
  summary: string;
  email: string;
  location: string;
  /** Path or URL to the resume (surfaced by the chat's showResume tool). */
  resumeUrl: string;
  socials: SocialLink[];
}

// TODO: replace placeholder copy with real content.
export const bio: Bio = {
  name: "Arif",
  role: "Software Engineer · AI & Interactive",
  tagline:
    "I build fast, distinctive web experiences — and the AI that makes them feel alive.",
  summary:
    "PLACEHOLDER bio. A few sentences on who Arif is, what he builds, and what he cares about. This text is shown in the About section and folded into the AI guide's system prompt, so keep it grounded and specific.",
  email: "hello@example.com",
  location: "Earth",
  resumeUrl: "/resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "X", href: "https://x.com/" },
  ],
};
