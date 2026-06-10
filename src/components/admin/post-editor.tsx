"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { AdminPostMeta } from "@/lib/admin/posts";
import { savePostAction, deletePostAction } from "@/app/admin/posts/actions";
import { StatusLine, savedMessage, type StatusMsg } from "./ui";

// Heavy editor pieces stay out of the first admin paint (and far away from
// the public site bundles).
const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-96 animate-pulse rounded-lg border border-border bg-surface/40" />
  ),
});
const MdxPreview = dynamic(() => import("./mdx-preview"), {
  ssr: false,
  loading: () => <p className="text-sm text-muted">Loading preview…</p>,
});

interface PostEditorProps {
  isNew: boolean;
  slug: string;
  sha: string | null;
  initialMeta: AdminPostMeta;
  initialBody: string;
}

function kebab(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function PostEditor({
  isNew,
  slug: initialSlug,
  sha,
  initialMeta,
  initialBody,
}: PostEditorProps) {
  const router = useRouter();
  const [meta, setMeta] = useState<AdminPostMeta>(initialMeta);
  const [slug, setSlug] = useState(initialSlug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [body, setBody] = useState(initialBody);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [message, setMessage] = useState<StatusMsg | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(
    () =>
      isNew ||
      body !== initialBody ||
      JSON.stringify(meta) !== JSON.stringify(initialMeta),
    [isNew, body, initialBody, meta, initialMeta],
  );

  function update<K extends keyof AdminPostMeta>(key: K, value: AdminPostMeta[K]) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await savePostAction({ slug, meta, body, sha, isNew });
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error ?? "Save failed." });
        return;
      }
      setMessage(savedMessage(result.mode, result.commitUrl));
      if (isNew) router.push(`/admin/posts/${slug}`);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${meta.title || slug}"? This commits a removal.`)) return;
    startTransition(async () => {
      const result = await deletePostAction({ slug, sha });
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error ?? "Delete failed." });
        return;
      }
      router.push("/admin/posts");
    });
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm outline-none placeholder:text-muted focus-visible:border-accent/60";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Title</span>
          <input
            className={inputClass}
            value={meta.title}
            onChange={(e) => {
              update("title", e.target.value);
              if (isNew && !slugTouched) setSlug(kebab(e.target.value));
            }}
            placeholder="Post title"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Slug {isNew ? "" : "(immutable)"}
          </span>
          <input
            className={`${inputClass} font-mono disabled:opacity-60`}
            value={slug}
            disabled={!isNew}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(kebab(e.target.value));
            }}
            placeholder="post-slug"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Date</span>
          <input
            type="date"
            className={inputClass}
            value={meta.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Tags (comma-separated)
          </span>
          <input
            className={inputClass}
            value={meta.tags.join(", ")}
            onChange={(e) =>
              update(
                "tags",
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            placeholder="Next.js, AI"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-muted">Description</span>
          <textarea
            className={`${inputClass} resize-y`}
            rows={2}
            value={meta.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="One or two sentences for the index, RSS, and SEO."
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={meta.draft ?? false}
            onChange={(e) => update("draft", e.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          Draft (hidden from the public site)
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1" role="tablist" aria-label="Editor view">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                tab === t
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "write" ? (
          <CodeEditor value={body} onChange={setBody} />
        ) : (
          <div className="min-h-96 rounded-lg border border-border bg-surface/20 p-6">
            <MdxPreview source={body} />
          </div>
        )}
      </div>

      <StatusLine message={message} />

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !dirty || !slug || !meta.title}
          className="inline-flex h-10 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {pending ? "Saving…" : isNew ? "Create post" : "Save changes"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm text-foreground/70 transition-colors hover:border-red-500/60 hover:text-red-500 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
