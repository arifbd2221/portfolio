"use client";

import { useState } from "react";
import { storySchema, type StoryBeat } from "@/content/story";
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

export function StoryEditor({
  initial,
  sha,
  rawBase,
}: {
  initial: StoryBeat[];
  sha: string | null;
  rawBase: string | null;
}) {
  const [beats, setBeats] = useState<StoryBeat[]>(initial);
  const { message, setMessage, pending, save } = useContentSave("story", sha);

  function update(index: number, patch: Partial<StoryBeat>) {
    setBeats((list) => list.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function move(index: number, dir: -1 | 1) {
    setBeats((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + dir, 0, item);
      return next;
    });
  }

  function handleSave() {
    const parsed = storySchema.safeParse({ beats });
    if (!parsed.success) {
      setMessage({
        kind: "error",
        text: parsed.error.issues
          .map((i) => `${i.path.join(".") || "story"}: ${i.message}`)
          .join(" · "),
      });
      return;
    }
    save(parsed.data);
  }

  return (
    <div className="space-y-6">
      {beats.map((beat, i) => (
        <fieldset key={i} className="rounded-xl border border-border p-4">
          <legend className="flex items-center gap-3 px-1 text-sm font-medium">
            Beat {i + 1}: {beat.heading || "untitled"}
            <MoveButtons
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              upDisabled={i === 0}
              downDisabled={i === beats.length - 1}
            />
            <GhostButton
              danger
              onClick={() => {
                if (beats.length > 1 && window.confirm("Remove this beat?")) {
                  setBeats((list) => list.filter((_, j) => j !== i));
                }
              }}
            >
              Remove
            </GhostButton>
          </legend>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <Field label="Kicker (small label)">
              <input className={inputClass} value={beat.kicker} onChange={(e) => update(i, { kicker: e.target.value })} />
            </Field>
            <Field label="Image">
              <div className="flex gap-2">
                <input className={inputClass} value={beat.image} onChange={(e) => update(i, { image: e.target.value })} />
                <MediaPicker rawBase={rawBase} onPick={(path) => update(i, { image: path })} label="Pick" />
              </div>
            </Field>
            <Field label="Heading" className="sm:col-span-2">
              <input className={inputClass} value={beat.heading} onChange={(e) => update(i, { heading: e.target.value })} />
            </Field>
            <Field label="Body" className="sm:col-span-2">
              <textarea
                className={`${inputClass} resize-y`}
                rows={3}
                value={beat.body}
                onChange={(e) => update(i, { body: e.target.value })}
              />
            </Field>
          </div>
        </fieldset>
      ))}

      <GhostButton
        onClick={() =>
          setBeats((list) => [
            ...list,
            {
              id: `beat-${list.length + 1}-${list.map((b) => b.id).join("").length}`,
              image: "/images/story/",
              kicker: "",
              heading: "",
              body: "",
            },
          ])
        }
      >
        Add beat
      </GhostButton>

      <StatusLine message={message} />
      <div className="border-t border-border pt-4">
        <PrimaryButton onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : "Save story"}
        </PrimaryButton>
      </div>
    </div>
  );
}
