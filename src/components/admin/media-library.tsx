"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  listMediaAction,
  uploadMediaAction,
  deleteMediaAction,
} from "@/app/admin/actions";
import { processImageFile } from "@/lib/admin/image-client";
import { MEDIA_FOLDERS } from "@/lib/admin/media-shared";
import {
  GhostButton,
  StatusLine,
  savedMessage,
  type StatusMsg,
} from "./ui";

interface MediaItemView {
  path: string;
  sha: string | null;
  size: number;
}

interface MediaLibraryProps {
  /** raw.githubusercontent base for not-yet-deployed images (GitHub mode). */
  rawBase: string | null;
  /** Pick mode: clicking an image calls this instead of showing manage actions. */
  onPick?: (path: string) => void;
  defaultFolder?: (typeof MEDIA_FOLDERS)[number];
}

function Thumb({ path, rawBase }: { path: string; rawBase: string | null }) {
  const [src, setSrc] = useState(path);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails; sizes unknown ahead of optimization
    <img
      src={src}
      alt=""
      loading="lazy"
      className="aspect-square w-full rounded-md object-cover"
      onError={() => {
        if (rawBase && src === path) setSrc(`${rawBase}/public${path}`);
      }}
    />
  );
}

export function MediaLibrary({ rawBase, onPick, defaultFolder = "blog" }: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItemView[] | null>(null);
  const [folder, setFolder] = useState<(typeof MEDIA_FOLDERS)[number]>(defaultFolder);
  const [message, setMessage] = useState<StatusMsg | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refresh() {
    startTransition(async () => {
      const result = await listMediaAction();
      if (result.ok && result.data) setItems(result.data);
      else setMessage({ kind: "error", text: result.error ?? "Could not list media." });
    });
  }

  // Initial load (event-free data fetch via transition keeps lint happy).
  useEffect(() => {
    let cancelled = false;
    listMediaAction().then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) setItems(result.data);
      else setMessage({ kind: "error", text: result.error ?? "Could not list media." });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setMessage(null);
    startTransition(async () => {
      for (const file of Array.from(files)) {
        try {
          const processed = await processImageFile(file);
          const result = await uploadMediaAction({
            folder,
            fileName: processed.fileName,
            base64: processed.base64,
          });
          if (!result.ok) {
            setMessage({ kind: "error", text: result.error ?? "Upload failed." });
            return;
          }
          setMessage(savedMessage(result.mode, result.commitUrl));
        } catch (err) {
          setMessage({
            kind: "error",
            text: err instanceof Error ? err.message : "Upload failed.",
          });
          return;
        }
      }
      const listed = await listMediaAction();
      if (listed.ok && listed.data) setItems(listed.data);
    });
  }

  function handleDelete(item: MediaItemView) {
    if (!window.confirm(`Delete ${item.path}? Anything referencing it will break.`)) return;
    setMessage(null);
    startTransition(async () => {
      const result = await deleteMediaAction({ path: item.path, sha: item.sha });
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error ?? "Delete failed." });
        return;
      }
      setMessage(savedMessage(result.mode));
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Upload to:</span>
        {MEDIA_FOLDERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFolder(f)}
            className={`rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              folder === f
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
        <GhostButton onClick={() => fileInputRef.current?.click()} disabled={pending}>
          {pending ? "Working…" : "Upload images"}
        </GhostButton>
      </div>

      <StatusLine message={message} />

      {items === null ? (
        <p className="text-sm text-muted">Loading media…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No images yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.path} className="group relative">
              {onPick ? (
                <button
                  type="button"
                  onClick={() => onPick(item.path)}
                  className="block w-full overflow-hidden rounded-md border border-border transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-label={`Pick ${item.path}`}
                >
                  <Thumb path={item.path} rawBase={rawBase} />
                </button>
              ) : (
                <div className="overflow-hidden rounded-md border border-border">
                  <Thumb path={item.path} rawBase={rawBase} />
                  <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(item.path)}
                      className="truncate text-left font-mono text-[10px] text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      title={`Copy ${item.path}`}
                    >
                      {item.path.split("/").pop()}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete ${item.path}`}
                      className="shrink-0 text-xs text-muted transition-colors hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
