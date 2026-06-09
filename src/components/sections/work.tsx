import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/content/projects";

export function Work() {
  return (
    <Section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto w-full max-w-5xl px-6 py-28"
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Work
        </p>
        <h2
          id="work-heading"
          className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Selected projects
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.id} delaySeconds={(i % 2) * 0.05}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
