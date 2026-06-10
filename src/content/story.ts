import { z } from "zod";
import raw from "./story.json";

/**
 * Scrollytelling "story" beats — backed by story.json so the admin can edit
 * (and reorder) them. Data-driven: the animation engine never needs editing
 * to change the narrative. Images can be shared with the gallery.
 */
const storyBeatSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  image: z.string().startsWith("/"),
  kicker: z.string().min(1),
  heading: z.string().min(1),
  body: z.string().min(1),
});

const storySchema = z.object({
  beats: z.array(storyBeatSchema).min(1),
});

export type StoryBeat = z.infer<typeof storyBeatSchema>;

export const story: { beats: StoryBeat[] } = storySchema.parse(raw);
