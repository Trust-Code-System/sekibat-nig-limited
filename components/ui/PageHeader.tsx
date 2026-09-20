import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/primitives";

/**
 * Masthead for every interior page. Extra top padding clears the fixed cinematic nav.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumb,
  aside,
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  breadcrumb?: { label: string; href: string }[];
  aside?: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <header
      className={cn(dark ? "bg-onyx text-ivory" : "bg-ivory text-ink")}
      data-nav-tone={dark ? "dark" : "light"}
    >
      <Container className="pt-28 pb-16 md:pt-32 md:pb-20">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol
              className={cn(
                "flex flex-wrap items-center gap-2 text-[0.625rem] font-medium tracking-[0.16em] uppercase",
                dark ? "text-ivory/45" : "text-ink-faint"
              )}
            >
              {breadcrumb.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>/</span>}
                  <Link
                    href={crumb.href}
                    className={cn(
                      "transition-colors",
                      dark ? "hover:text-ivory" : "hover:text-ink"
                    )}
                  >
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className={cn("cine-eyebrow", dark ? "text-ivory/75" : "text-ink-muted")}>
              {eyebrow}
            </p>
            <h1 className="mt-6 max-w-[16ch] font-sans text-[clamp(2.5rem,1.1rem+4.6vw,5.25rem)] leading-[0.94] font-medium tracking-[-0.045em]">
              {title}
            </h1>
          </div>

          {intro && (
            <div className="md:col-span-4 md:self-end">
              <p className={cn("max-w-[42ch] text-md", dark ? "text-ivory/65" : "text-ink-muted")}>
                {intro}
              </p>
            </div>
          )}

          {aside && <div className="md:col-span-4 md:self-end">{aside}</div>}
        </div>
      </Container>
    </header>
  );
}
