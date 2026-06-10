import { z } from "zod";
import raw from "./bio.json";

/**
 * Bio / identity content — backed by bio.json so the admin can edit it.
 * zod gives runtime validation (bad commits fail the build, not the page)
 * and the inferred types keep the public API identical to the old TS file.
 */
const socialLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
});

export const bioSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  email: z.string().email(),
  location: z.string().min(1),
  portrait: z.string().startsWith("/"),
  skills: z.array(z.string().min(1)),
  resumeUrl: z.string().startsWith("/"),
  socials: z.array(socialLinkSchema),
});

export type SocialLink = z.infer<typeof socialLinkSchema>;
export type Bio = z.infer<typeof bioSchema>;

export const bio: Bio = bioSchema.parse(raw);
