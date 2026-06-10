"use client";

import type { ReactNode } from "react";

/** Shared admin form primitives — keeps the four editors visually consistent. */

export const inputClass =
  "w-full rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm outline-none placeholder:text-muted focus-visible:border-accent/60 disabled:opacity-60";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function MoveButtons({
  onUp,
  onDown,
  upDisabled,
  downDisabled,
}: {
  onUp: () => void;
  onDown: () => void;
  upDisabled?: boolean;
  downDisabled?: boolean;
}) {
  const cls =
    "inline-flex size-7 items-center justify-center rounded-md border border-border text-xs text-muted transition-colors hover:text-foreground disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  return (
    <span className="inline-flex gap-1">
      <button type="button" aria-label="Move up" className={cls} onClick={onUp} disabled={upDisabled}>
        ↑
      </button>
      <button type="button" aria-label="Move down" className={cls} onClick={onDown} disabled={downDisabled}>
        ↓
      </button>
    </span>
  );
}

export interface StatusMsg {
  kind: "ok" | "error";
  text: string;
}

export function StatusLine({ message }: { message: StatusMsg | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={`text-sm ${message.kind === "ok" ? "text-accent" : "text-amber-500"}`}
    >
      {message.text}
    </p>
  );
}

export function savedMessage(mode?: "github" | "local"): StatusMsg {
  return {
    kind: "ok",
    text:
      mode === "github"
        ? "Committed — live in a minute or two once Vercel finishes building."
        : "Saved to the local working tree (dev mode — commit it yourself).",
  };
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center rounded-full border border-border px-4 text-sm transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        danger
          ? "text-foreground/70 hover:border-red-500/60 hover:text-red-500"
          : "text-foreground/80 hover:bg-surface hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
