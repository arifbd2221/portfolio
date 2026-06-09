import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { GalleryGrid } from "@/components/gallery-grid";

export function Gallery() {
  return (
    <Section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="mx-auto w-full max-w-5xl px-6 py-28"
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Gallery
        </p>
        <h2
          id="gallery-heading"
          className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          A few frames
        </h2>
      </Reveal>

      <div className="mt-12">
        <GalleryGrid />
      </div>
    </Section>
  );
}
