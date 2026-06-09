import { bio } from "@/content/bio";

export default function Home() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative mx-auto flex min-h-[calc(100dvh-65px)] w-full max-w-5xl flex-col justify-center px-6 py-24"
    >
      <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-xs text-muted">
        <span className="size-1.5 rounded-full bg-accent" />
        Phase 0 scaffold — sections land in the phases ahead
      </p>

      <h1
        id="hero-heading"
        className="max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
      >
        {bio.tagline}
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        {bio.name} — {bio.role}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href={`mailto:${bio.email}`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Get in touch
        </a>
        {bio.socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {s.label}
          </a>
        ))}
      </div>
    </section>
  );
}
