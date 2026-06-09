"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { motion } from "motion/react";
import { useAppStore } from "@/lib/store";
import { useScrollTo } from "@/lib/lenis";
import { bio } from "@/content/bio";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

// Minimal structural view of an AI SDK tool UI part.
interface ToolPart {
  type: string;
  toolCallId?: string;
  state?: string;
  input?: Record<string, unknown>;
}

const SUGGESTIONS = [
  "Show me your Aurora project",
  "What can you build?",
  "Show me your resume",
];

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");

  const setSceneCommand = useAppStore((s) => s.setSceneCommand);
  const scrollTo = useScrollTo();
  const handledToolCalls = useRef<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";

  // Dispatch tool calls → store / navigation / resume (once per call).
  useEffect(() => {
    for (const message of messages) {
      if (message.role !== "assistant") continue;
      for (const part of message.parts) {
        if (!part.type.startsWith("tool-")) continue;
        const toolPart = part as unknown as ToolPart;
        const id = toolPart.toolCallId;
        if (!id || handledToolCalls.current.has(id)) continue;
        if (
          toolPart.state !== "input-available" &&
          toolPart.state !== "output-available"
        ) {
          continue;
        }
        handledToolCalls.current.add(id);

        const name = part.type.slice("tool-".length);
        const args = toolPart.input ?? {};

        if (name === "focusProject" && typeof args.id === "string") {
          setSceneCommand({ type: "focusProject", id: args.id });
          scrollTo("#work");
        } else if (name === "navigateTo" && typeof args.section === "string") {
          scrollTo(`#${args.section}`);
        } else if (name === "showResume") {
          window.open(bio.resumeUrl, "_blank", "noopener,noreferrer");
        }
      }
    }
  }, [messages, setSceneCommand, scrollTo]);

  // Focus the input when opened.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Keep the latest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  function ask(text: string) {
    if (busy) return;
    sendMessage({ text });
  }

  return (
    <motion.section
      role="dialog"
      aria-label="Portfolio chat guide"
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={{
        opacity: open ? 1 : 0,
        y: open ? 0 : 16,
        scale: open ? 1 : 0.98,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed bottom-24 right-6 z-50 flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-md data-[hidden=true]:pointer-events-none"
      data-hidden={!open}
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent" />
          <p className="text-sm font-medium">Ask about {bio.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ✕
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              I&apos;m {bio.name}&apos;s guide. Ask about the work, or try:
            </p>
            <div className="flex flex-col items-start gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-foreground/80 transition-colors hover:border-accent/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const text = message.parts
            .filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join("");
          const toolNames = message.parts
            .filter((p) => p.type.startsWith("tool-"))
            .map((p) => p.type.slice("tool-".length));

          return (
            <div
              key={message.id}
              className={
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2 text-sm text-accent-foreground"
                    : "max-w-[90%] text-sm leading-relaxed text-foreground/90"
                }
              >
                {toolNames.length > 0 && (
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-accent">
                    ✦ {toolNames.join(", ")}
                  </p>
                )}
                {text}
                {message.role === "assistant" &&
                  status === "streaming" &&
                  message === messages[messages.length - 1] && (
                    <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle" />
                  )}
              </div>
            </div>
          );
        })}

        {error && (
          <p className="text-sm text-amber-500">
            Something went wrong. Please try again in a moment.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the work…"
          aria-label="Message"
          className="min-w-0 flex-1 rounded-full border border-border bg-surface/60 px-4 py-2 text-sm outline-none placeholder:text-muted focus-visible:border-accent/60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ↑
        </button>
      </form>
    </motion.section>
  );
}
