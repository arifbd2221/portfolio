"use client";

import { useMemo, useState } from "react";
import { projectsSchema, type Project } from "@/content/projects";
import { MediaPicker } from "./media-picker";
import { useContentSave } from "./use-content-save";
import {
  Field,
  GhostButton,
  MoveButtons,
  PrimaryButton,
  StatusLine,
  inputClass,
} from "./ui";

function kebab(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const blankProject = (): Project => ({
  id: "",
  title: "",
  slug: "",
  summary: "",
  tags: [],
  role: "",
  year: new Date().getFullYear(),
  links: [],
  cover: "/images/projects/",
  body: "",
});

export function ProjectsEditor({
  initial,
  sha,
  rawBase,
}: {
  initial: Project[];
  sha: string | null;
  rawBase: string | null;
}) {
  const [items, setItems] = useState<Project[]>(initial);
  const { message, setMessage, pending, save } = useContentSave("projects", sha);
  // Existing ids are immutable — the AI's focusProject tool and the 3D scene
  // target them. Only never-saved items get an editable id.
  const lockedIds = useMemo(() => new Set(initial.map((p) => p.id)), [initial]);

  function update(index: number, patch: Partial<Project>) {
    setItems((list) => list.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + dir, 0, item);
      return next;
    });
  }

  function handleSave() {
    const parsed = projectsSchema.safeParse(items);
    if (!parsed.success) {
      setMessage({
        kind: "error",
        text: parsed.error.issues
          .map((i) => `${i.path.join(".") || "projects"}: ${i.message}`)
          .join(" · "),
      });
      return;
    }
    save(parsed.data);
  }

  return (
    <div className="space-y-6">
      {items.map((project, i) => {
        const isNew = !lockedIds.has(project.id);
        return (
          <fieldset key={i} className="rounded-xl border border-border p-4">
            <legend className="flex items-center gap-3 px-1 text-sm font-medium">
              {project.title || "New project"}
              <MoveButtons
                onUp={() => move(i, -1)}
                onDown={() => move(i, 1)}
                upDisabled={i === 0}
                downDisabled={i === items.length - 1}
              />
              <GhostButton
                danger
                onClick={() => {
                  if (window.confirm(`Remove "${project.title || "this project"}"?`)) {
                    setItems((list) => list.filter((_, j) => j !== i));
                  }
                }}
              >
                Remove
              </GhostButton>
            </legend>

            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input
                  className={inputClass}
                  value={project.title}
                  onChange={(e) => {
                    const patch: Partial<Project> = { title: e.target.value };
                    if (isNew) {
                      patch.id = kebab(e.target.value);
                      patch.slug = kebab(e.target.value);
                    }
                    update(i, patch);
                  }}
                />
              </Field>
              <Field label={isNew ? "Id (locks after first save)" : "Id (immutable — AI/3D target)"}>
                <input
                  className={`${inputClass} font-mono`}
                  value={project.id}
                  disabled={!isNew}
                  onChange={(e) => update(i, { id: kebab(e.target.value), slug: kebab(e.target.value) })}
                />
              </Field>
              <Field label="Role">
                <input className={inputClass} value={project.role} onChange={(e) => update(i, { role: e.target.value })} />
              </Field>
              <Field label="Year">
                <input
                  className={inputClass}
                  type="number"
                  value={project.year}
                  onChange={(e) => update(i, { year: Number(e.target.value) })}
                />
              </Field>
              <Field label="Summary" className="sm:col-span-2">
                <textarea
                  className={`${inputClass} resize-y`}
                  rows={2}
                  value={project.summary}
                  onChange={(e) => update(i, { summary: e.target.value })}
                />
              </Field>
              <Field label="Tags (comma-separated)">
                <input
                  className={inputClass}
                  value={project.tags.join(", ")}
                  onChange={(e) =>
                    update(i, {
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                />
              </Field>
              <Field label="Cover image">
                <div className="flex gap-2">
                  <input className={inputClass} value={project.cover} onChange={(e) => update(i, { cover: e.target.value })} />
                  <MediaPicker rawBase={rawBase} onPick={(path) => update(i, { cover: path })} label="Pick" />
                </div>
              </Field>
              <Field label="Links (label | url, one per line)" className="sm:col-span-2">
                <textarea
                  className={`${inputClass} resize-y font-mono`}
                  rows={2}
                  value={project.links.map((l) => `${l.label} | ${l.href}`).join("\n")}
                  onChange={(e) =>
                    update(i, {
                      links: e.target.value
                        .split("\n")
                        .map((line) => {
                          const [label, href] = line.split("|").map((s) => s.trim());
                          return label && href ? { label, href } : null;
                        })
                        .filter((l): l is { label: string; href: string } => l !== null),
                    })
                  }
                />
              </Field>
              <Field label="Case study body" className="sm:col-span-2">
                <textarea
                  className={`${inputClass} resize-y`}
                  rows={5}
                  value={project.body}
                  onChange={(e) => update(i, { body: e.target.value })}
                />
              </Field>
            </div>
          </fieldset>
        );
      })}

      <GhostButton onClick={() => setItems((list) => [...list, blankProject()])}>
        Add project
      </GhostButton>

      <StatusLine message={message} />
      <div className="border-t border-border pt-4">
        <PrimaryButton onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : "Save projects"}
        </PrimaryButton>
      </div>
    </div>
  );
}
