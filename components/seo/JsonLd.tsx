/**
 * Structured data. Kept as a component so every route emits it the same way and the shape
 * stays in `lib/seo.ts` rather than being hand-rolled per page.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own data in lib/seo.ts, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
