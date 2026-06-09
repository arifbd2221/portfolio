"use client";

import { useState } from "react";
import { ChatPanel } from "./ChatPanel";

/**
 * Global floating chat launcher. The Claude-powered guide answers questions and
 * its tool calls drive the 3D scene + navigation (see ChatPanel).
 * The panel stays mounted (visibility toggled) so the conversation persists.
 */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Chat with the portfolio guide"}
        className="fixed bottom-6 right-6 z-50 inline-flex size-14 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? (
          <CloseIcon className="size-6" />
        ) : (
          <ChatIcon className="size-6" />
        )}
      </button>

      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
