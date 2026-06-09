/**
 * Scrollytelling "story" beats (Phase 4). PLACEHOLDER copy + images.
 *
 * Data-driven so the animation engine never needs editing to change the
 * narrative. Images are shared with the gallery (Phase 6) — prefer referencing
 * the same files under /public/images so they aren't duplicated.
 */

export interface StoryBeat {
  /** Stable id for the beat. */
  id: string;
  /** Image path under /public/images. */
  image: string;
  /** Small label above the heading. */
  kicker: string;
  heading: string;
  body: string;
}

// TODO: replace with the real life-event narrative + images.
export const story: { beats: StoryBeat[] } = {
  beats: [
    {
      id: "beat-1",
      image: "/images/story/beat-1.jpg",
      kicker: "PLACEHOLDER · 2015",
      heading: "Where it started",
      body: "PLACEHOLDER beat copy. One or two sentences that advance the story as the reader scrolls.",
    },
    {
      id: "beat-2",
      image: "/images/story/beat-2.jpg",
      kicker: "PLACEHOLDER · 2019",
      heading: "The turning point",
      body: "PLACEHOLDER beat copy.",
    },
    {
      id: "beat-3",
      image: "/images/story/beat-3.jpg",
      kicker: "PLACEHOLDER · Today",
      heading: "Now",
      body: "PLACEHOLDER beat copy.",
    },
  ],
};
