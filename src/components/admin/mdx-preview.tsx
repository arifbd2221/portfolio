"use client";

import { useEffect, useState, type ComponentType } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { Callout } from "@/components/mdx/callout";

/**
 * Live MDX preview, compiled in the browser (debounced). Prose styling +
 * the Callout component match the real post layout; code blocks render
 * unhighlighted here — Shiki fidelity arrives with the deployed build.
 */
export default function MdxPreview({ source }: { source: string }) {
  const [Content, setContent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const mod = await evaluate(source, {
          ...runtime,
          remarkPlugins: [remarkGfm],
          useMDXComponents: () => ({ Callout }),
        });
        if (!cancelled) {
          setContent(() => mod.default);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "MDX compile error.");
        }
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source]);

  if (error) {
    return (
      <p className="font-mono text-sm text-amber-500" role="alert">
        MDX error: {error}
      </p>
    );
  }
  if (!Content) return <p className="text-sm text-muted">Compiling…</p>;

  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert prose-pre:rounded-xl prose-pre:border prose-pre:border-border">
      <Content />
    </div>
  );
}
