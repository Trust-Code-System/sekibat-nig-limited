/**
 * Minimal class joiner. Deliberately not tailwind-merge: the design system uses fixed scales
 * and variants rather than ad-hoc overrides, so conflicting classes are a smell to fix at the
 * call site, not to paper over at runtime.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
