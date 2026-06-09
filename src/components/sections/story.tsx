import { Section } from "@/components/section";
import { StoryTrack } from "@/components/story-track";
import { story } from "@/content/story";

export function Story() {
  return (
    <Section id="story" aria-label="Story">
      <StoryTrack beats={story.beats} />
    </Section>
  );
}
