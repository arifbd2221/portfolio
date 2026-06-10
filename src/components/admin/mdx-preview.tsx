"use client";

import { useEffect, useState, type ComponentType } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { Callout } from "@/components/mdx/callout";

/**
 * Live MDX preview, compiled in the browser (debounced), with the same Shiki
 * theme as the deployed build (rehype-pretty-code runs client-side here — the
 * highlighter loads lazily inside this already-lazy admin chunk).
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
          rehypePlugins: [
            [
              rehypePrettyCode,
              { theme: "github-dark-dimmed", keepBackground: true },
            ],
          ],
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
