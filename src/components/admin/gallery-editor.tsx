"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { galleryImageSchema, type GalleryImage } from "@/content/gallery";
import { probeImage } from "@/lib/admin/image-client";
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

const gallerySchema = z.array(galleryImageSchema);

function idFromPath(path: string, taken: Set<string>): string {
  const base =
    path.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]/g, "-") ||
    "photo";
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

export function GalleryEditor({
  initial,
  sha,
  rawBase,
}: {
  initial: GalleryImage[];
  sha: string | null;
  rawBase: string | null;
}) {
  const [items, setItems] = useState<GalleryImage[]>(initial);
  const { message, setMessage, pending, save } = useContentSave("gallery", sha);
  const [probing, startProbe] = useTransition();

  function update(index: number, patch: Partial<GalleryImage>) {
    setItems((list) => list.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + dir, 0, item);
      return next;
    });
  }

  function handleAdd(path: string) {
    setMessage(null);
    startProbe(async () => {
      try {
        // Site path first; fall back to the raw repo URL for images committed
        // but not yet deployed.
        const meta = await probeImage(path).catch(() => {
          if (!rawBase) throw new Error(`Could not load ${path}`);
          return probeImage(`${rawBase}/public${path}`);
        });
        setItems((list) => [
          ...list,
          {
            id: idFromPath(path, new Set(list.map((g) => g.id))),
            src: path,
            alt: "",
            width: meta.width,
            height: meta.height,
            blurDataURL: meta.blurDataURL,
          },
        ]);
      } catch (err) {
        setMessage({
          kind: "error",
          text: err instanceof Error ? err.message : "Could not read that image.",
        });
      }
    });
  }

  function handleSave() {
    const parsed = gallerySchema.safeParse(items);
    if (!parsed.success) {
      setMessage({
        kind: "error",
        text: parsed.error.issues
          .map((i) => {
            const idx = typeof i.path[0] === "number" ? `photo ${i.path[0] + 1} ` : "";
            return `${idx}${i.path.slice(1).join(".")}: ${i.message}`;
          })
          .join(" · "),
      });
      return;
    }
    save(parsed.data);
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-4 rounded-xl border border-border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
          <img
            src={item.blurDataURL}
            alt=""
            className="size-20 shrink-0 rounded-md border border-border object-cover"
          />
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <Field label="Alt text (required)" className="sm:col-span-2">
              <input
                className={inputClass}
                value={item.alt}
                onChange={(e) => update(i, { alt: e.target.value })}
                placeholder="Describe the photo for screen readers"
              />
            </Field>
            <Field label="Caption (optional)">
              <input
                className={inputClass}
                value={item.caption ?? ""}
                onChange={(e) => update(i, { caption: e.target.value || undefined })}
              />
            </Field>
            <div className="flex items-end justify-between gap-2">
              <p className="truncate font-mono text-xs text-muted" title={item.src}>
                {item.src} · {item.width}×{item.height}
              </p>
              <span className="flex shrink-0 items-center gap-2">
                <MoveButtons
                  onUp={() => move(i, -1)}
                  onDown={() => move(i, 1)}
                  upDisabled={i === 0}
                  downDisabled={i === items.length - 1}
                />
                <GhostButton
                  danger
                  onClick={() => {
                    if (window.confirm("Remove this photo from the gallery? (The file stays in media.)")) {
                      setItems((list) => list.filter((_, j) => j !== i));
                    }
                  }}
                >
                  Remove
                </GhostButton>
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <MediaPicker rawBase={rawBase} onPick={handleAdd} label={probing ? "Reading image…" : "Add photo"} />
      </div>

      <StatusLine message={message} />
      <div className="border-t border-border pt-4">
        <PrimaryButton onClick={handleSave} disabled={pending || probing}>
          {pending ? "Saving…" : "Save gallery"}
        </PrimaryButton>
      </div>
    </div>
  );
}
