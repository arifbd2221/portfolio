/**
 * Global chat launcher slot.
 *
 * Phase 0: a non-interactive placeholder button pinned bottom-right.
 * Phase 7 wires this to the Claude streaming chat (useChat from @ai-sdk/react),
 * intercepts tool-call parts, and dispatches them to the store as sceneCommands
 * that drive the 3D scene.
 */
export function ChatLauncher() {
  return (
    <button
      type="button"
      disabled
      aria-label="Chat with the portfolio guide (coming soon)"
      title="Coming soon"
      className="fixed bottom-6 right-6 z-50 inline-flex size-14 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground/70 shadow-lg backdrop-blur-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    >
      <ChatIcon className="size-6" />
    </button>
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
