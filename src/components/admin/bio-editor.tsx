"use client";

import { useRef, useState, useTransition } from "react";
import { bioSchema, type Bio } from "@/content/bio";
import { uploadResumeAction } from "@/app/admin/actions";
import { MediaPicker } from "./media-picker";
import { useContentSave } from "./use-content-save";
import {
  Field,
  GhostButton,
  PrimaryButton,
  StatusLine,
  inputClass,
  savedMessage,
} from "./ui";

export function BioEditor({
  initial,
  sha,
  rawBase,
}: {
  initial: Bio;
  sha: string | null;
  rawBase: string | null;
}) {
  const [bio, setBio] = useState<Bio>(initial);
  const { message, setMessage, pending, save } = useContentSave("bio", sha);
  const [resumePending, startResume] = useTransition();
  const resumeInput = useRef<HTMLInputElement>(null);

  function update<K extends keyof Bio>(key: K, value: Bio[K]) {
    setBio((b) => ({ ...b, [key]: value }));
  }

  function handleSave() {
    const parsed = bioSchema.safeParse(bio);
    if (!parsed.success) {
      setMessage({
        kind: "error",
        text: parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" · "),
      });
      return;
    }
    save(parsed.data);
  }

  function handleResume(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    startResume(async () => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
      });
      const result = await uploadResumeAction({
        base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
      });
      setMessage(
        result.ok
          ? savedMessage(result.mode)
          : { kind: "error", text: result.error ?? "Resume upload failed." },
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className={inputClass} value={bio.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Role">
          <input className={inputClass} value={bio.role} onChange={(e) => update("role", e.target.value)} />
        </Field>
        <Field label="Tagline (hero headline)" className="sm:col-span-2">
          <input className={inputClass} value={bio.tagline} onChange={(e) => update("tagline", e.target.value)} />
        </Field>
        <Field label="Summary (About + AI grounding)" className="sm:col-span-2">
          <textarea
            className={`${inputClass} resize-y`}
            rows={4}
            value={bio.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input className={inputClass} type="email" value={bio.email} onChange={(e) => update("email", e.target.value)} />
        </Field>
        <Field label="Location">
          <input className={inputClass} value={bio.location} onChange={(e) => update("location", e.target.value)} />
        </Field>
        <Field label="Portrait path">
          <div className="flex gap-2">
            <input className={inputClass} value={bio.portrait} onChange={(e) => update("portrait", e.target.value)} />
            <MediaPicker rawBase={rawBase} onPick={(path) => update("portrait", path)} label="Pick" />
          </div>
        </Field>
        <Field label="Resume (PDF at /resume.pdf)">
          <div className="flex items-center gap-2">
            <input
              ref={resumeInput}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => {
                handleResume(e.target.files);
                e.target.value = "";
              }}
            />
            <GhostButton onClick={() => resumeInput.current?.click()} disabled={resumePending}>
              {resumePending ? "Uploading…" : "Upload new resume"}
            </GhostButton>
          </div>
        </Field>
        <Field label="Skills (one per line)" className="sm:col-span-2">
          <textarea
            className={`${inputClass} resize-y font-mono`}
            rows={5}
            value={bio.skills.join("\n")}
            onChange={(e) =>
              update(
                "skills",
                e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              )
            }
          />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Social links</p>
        <div className="space-y-2">
          {bio.socials.map((social, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${inputClass} max-w-36`}
                value={social.label}
                aria-label={`Social ${i + 1} label`}
                onChange={(e) =>
                  update(
                    "socials",
                    bio.socials.map((s, j) => (j === i ? { ...s, label: e.target.value } : s)),
                  )
                }
              />
              <input
                className={inputClass}
                value={social.href}
                aria-label={`Social ${i + 1} URL`}
                onChange={(e) =>
                  update(
                    "socials",
                    bio.socials.map((s, j) => (j === i ? { ...s, href: e.target.value } : s)),
                  )
                }
              />
              <GhostButton danger onClick={() => update("socials", bio.socials.filter((_, j) => j !== i))}>
                Remove
              </GhostButton>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <GhostButton onClick={() => update("socials", [...bio.socials, { label: "", href: "https://" }])}>
            Add link
          </GhostButton>
        </div>
      </div>

      <StatusLine message={message} />
      <div className="border-t border-border pt-4">
        <PrimaryButton onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : "Save bio"}
        </PrimaryButton>
      </div>
    </div>
  );
}
