/**
 * Renders a JSON-LD <script>. Server component; data is serialized at render.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline here (no user-controlled HTML).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
