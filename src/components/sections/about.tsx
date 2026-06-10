import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { AboutPortrait } from "@/components/about-portrait";
import { bio } from "@/content/bio";

export function About() {
  return (
    <Section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto w-full max-w-5xl px-6 py-28"
    >
      <div className="grid items-start gap-12 md:grid-cols-[2fr_1fr]">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            About
          </p>
          <h2
            id="about-heading"
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {bio.name}
          </h2>
          <p className="mt-2 text-muted">{bio.role}</p>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-foreground/90">
            {bio.summary}
          </p>

          <h3 className="mt-10 font-mono text-xs uppercase tracking-widest text-muted">
            Skills &amp; tools
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {bio.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-border bg-surface/40 px-3 py-1 text-sm text-foreground/80"
              >
                {skill}
              </li>
            ))}
          </ul>
        </Reveal>

        <AboutPortrait />
      </div>
    </Section>
  );
}
