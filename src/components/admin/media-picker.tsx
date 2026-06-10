"use client";

import { useState } from "react";
import { MediaLibrary } from "./media-library";
import { GhostButton } from "./ui";

/**
 * "Pick an image" dialog used by the structured-content editors. Renders the
 * media library in pick mode; selection returns the site path.
 */
export function MediaPicker({
  rawBase,
  onPick,
  label = "Pick image",
}: {
  rawBase: string | null;
  onPick: (path: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GhostButton onClick={() => setOpen(true)}>{label}</GhostButton>
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-label="Pick an image"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Pick an image</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close picker"
                className="rounded-md p-1 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                ✕
              </button>
            </div>
            <MediaLibrary
              rawBase={rawBase}
              onPick={(path) => {
                setOpen(false);
                onPick(path);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
