import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { bio } from "@/content/bio";

export function Contact() {
  return (
    <Section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto w-full max-w-5xl px-6 py-28"
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Contact
        </p>
        <h2
          id="contact-heading"
          className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
        >
          Let&apos;s build something distinctive.
        </h2>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
          Have a project in mind, or just want to say hello? The fastest way to
          reach me is email.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${bio.email}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {bio.email}
          </a>
          {bio.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
