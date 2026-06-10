/**
 * Renders a JSON-LD <script>. Server component; data is serialized at render.
 * `<` is escaped to < so no string value (e.g. an admin-edited bio field
 * containing "</script>") can terminate the script block — the standard
 * JSON-in-HTML hardening.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
