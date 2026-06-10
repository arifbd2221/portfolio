"use client";

import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useTheme } from "next-themes";

/**
 * Markdown editor (CodeMirror 6). Loaded lazily by the post editor so it only
 * ships in the admin chunk.
 */
export default function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="overflow-hidden rounded-lg border border-border [&_.cm-editor]:text-sm">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[markdown()]}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        minHeight="24rem"
        basicSetup={{ lineNumbers: false, foldGutter: false }}
        aria-label="Post body (MDX)"
      />
    </div>
  );
}
