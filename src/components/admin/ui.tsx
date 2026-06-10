"use client";

import { useEffect, useState, type ReactNode } from "react";
import { deployStatusAction } from "@/app/admin/actions";

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
  /** "View commit ↗" link (GitHub mode saves). */
  link?: string;
  /** Show the live deploy-status pill (GitHub mode saves). */
  deploy?: boolean;
}

const DEPLOY_LABELS: Record<string, string> = {
  QUEUED: "queued",
  INITIALIZING: "starting build",
  BUILDING: "building",
  READY: "live ✓",
  ERROR: "build failed",
  CANCELED: "build canceled",
};

/**
 * Polls the latest production deployment after a commit until it settles.
 * Renders nothing when VERCEL_TOKEN/PROJECT_ID aren't configured.
 */
function DeployPill() {
  const [state, setState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let polls = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const result = await deployStatusAction();
      if (cancelled) return;
      const next = result.ok ? result.data?.state ?? null : null;
      setState(next ?? null);
      polls += 1;
      const settled = next === "READY" || next === "ERROR" || next === "CANCELED";
      if (next !== null && !settled && polls < 40) timer = setTimeout(tick, 5000);
    };
    // First poll waits a beat so the push has reached Vercel.
    timer = setTimeout(tick, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (state === null) return null;
  const settledOk = state === "READY";
  const failed = state === "ERROR" || state === "CANCELED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
        settledOk
          ? "border-accent/60 text-accent"
          : failed
            ? "border-amber-500/60 text-amber-500"
            : "border-border text-muted"
      }`}
    >
      {!settledOk && !failed && (
        <span className="size-1.5 animate-pulse rounded-full bg-current" />
      )}
      deploy: {DEPLOY_LABELS[state] ?? state.toLowerCase()}
    </span>
  );
}

export function StatusLine({ message }: { message: StatusMsg | null }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={`flex flex-wrap items-center gap-2 text-sm ${
        message.kind === "ok" ? "text-accent" : "text-amber-500"
      }`}
    >
      {message.text}
      {message.link && (
        <a
          href={message.link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          View commit ↗
        </a>
      )}
      {message.deploy && <DeployPill />}
    </p>
  );
}

export function savedMessage(
  mode?: "github" | "local",
  commitUrl?: string,
): StatusMsg {
  return mode === "github"
    ? {
        kind: "ok",
        text: "Committed —",
        link: commitUrl,
        deploy: true,
      }
    : {
        kind: "ok",
        text: "Saved to the local working tree (dev mode — commit it yourself).",
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
