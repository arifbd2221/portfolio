"use client";

import { useRef, useState } from "react";
import { MediaLibrary } from "./media-library";
import { GhostButton } from "./ui";

/**
 * "Pick an image" dialog used by the structured-content editors. Renders the
 * media library in pick mode; selection returns the site path. Focus is
 * trapped while open; Escape closes and focus returns to the trigger.
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
  const dialogRef = useRef<HTMLDivElement>(null);

  function trapTab(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <GhostButton onClick={() => setOpen(true)}>{label}</GhostButton>
      {open && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pick an image"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            trapTab(e);
          }}
        >
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Pick an image</p>
              <button
                type="button"
                autoFocus
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
