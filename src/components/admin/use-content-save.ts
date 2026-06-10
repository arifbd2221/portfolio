"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveContentAction } from "@/app/admin/actions";
import type { ContentName } from "@/lib/admin/content";
import { savedMessage, type StatusMsg } from "./ui";

/** Shared save flow for the structured-content editors. */
export function useContentSave(name: ContentName, sha: string | null) {
  const [message, setMessage] = useState<StatusMsg | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function save(data: unknown) {
    setMessage(null);
    startTransition(async () => {
      const result = await saveContentAction({ name, data, sha });
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error ?? "Save failed." });
        return;
      }
      setMessage(savedMessage(result.mode, result.commitUrl));
      router.refresh();
    });
  }

  return { message, setMessage, pending, save };
}
