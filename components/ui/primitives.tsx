import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Layout and typographic primitives.
 *
 * These know nothing about properties, projects or the data layer — only about the design
 * system in `app/globals.css` and `STYLESEED.md`. Keep it that way.
 */

/* ------------------------------------------------------------------ container */

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-(--container-site) px-6 md:px-12", className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------- section */

/**
 * The asymmetric editorial section: an index and label pinned to the left two columns, the
 * content running from column three. This is the layout signature — a centred stack of
 * equal-width cards is exactly what the brief rules out.
 */
export function Section({
  index,
  label,
  note,
  action,
  children,
  className,
  tone = "paper",
  id,
}: {
  index?: string;
  label?: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "deep" | "night";
  id?: string;
}) {
  const tones = {
    paper: "bg-ivory text-ink",
    deep: "bg-ivory-deep text-ink",
    night: "on-night bg-onyx text-ivory",
  } as const;

  return (
    <section
      id={id}
      data-nav-tone={tone === "night" ? "dark" : "light"}
      className={cn("py-24 md:py-32", tones[tone], className)}
    >
      <Container>
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:gap-x-8">
          {(label || index || note) && (
            <header className="md:col-span-3 lg:col-span-2">
              {index && (
                <p
                  className={cn(
                    "label font-mono",
                    tone === "night" ? "text-bone-muted" : "text-ink-faint"
                  )}
                >
                  {index}
                </p>
              )}
              {label && (
                <h2
                  className={cn(
                    "label mt-3",
                    tone === "night" ? "text-bone" : "text-ink"
                  )}
                >
                  {label}
                </h2>
              )}
              {note && (
                <p
                  className={cn(
                    "mt-4 max-w-[26ch] text-sm",
                    tone === "night" ? "text-bone-muted" : "text-ink-muted"
                  )}
                >
                  {note}
                </p>
              )}
              {action && <div className="mt-6 hidden md:block">{action}</div>}
            </header>
          )}
          <div
            className={cn(
              label || index || note ? "md:col-span-9 lg:col-span-10" : "md:col-span-12"
            )}
          >
            {children}
          </div>
          {action && (
            <div className="md:hidden">{action}</div>
          )}
        </div>
      </Container>
    </section>
  );
}

/* ----------------------------------------------------------------- typography */

export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cn("label", className)}>{children}</Tag>;
}

/** Fraunces display type. `level` picks the size step; the tag is chosen separately. */
export function Display({
  children,
  className,
  as: Tag = "h2",
  level = 2,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  level?: 1 | 2 | 3;
}) {
  const sizes = {
    1: "text-d1",
    2: "text-d2",
    3: "text-d3",
  } as const;

  return (
    <Tag
      className={cn(
        "font-display font-light tracking-[-0.02em] text-balance",
        sizes[level],
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Long-form body copy. Splits on blank lines so data records can carry paragraphs. */
export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-5 text-md text-ink-muted", className)}>
      {text.split("\n\n").map((para, i) => (
        <p key={i} className="max-w-(--container-prose)">
          {para}
        </p>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------- rules */

export function Rule({ className, tone = "paper" }: { className?: string; tone?: "paper" | "night" }) {
  return (
    <hr
      className={cn(
        "border-0 border-t",
        tone === "night" ? "border-night-rule" : "border-rule",
        className
      )}
    />
  );
}

/* ------------------------------------------------------------------- actions */

type ButtonVariant = "solid" | "outline" | "quiet";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xs px-6 py-4 text-2xs font-medium uppercase tracking-[0.14em] transition-colors duration-200";

const buttonVariants: Record<ButtonVariant, string> = {
  solid: "bg-clay text-paper hover:bg-clay-deep",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  quiet: "border border-rule text-ink-muted hover:border-ink hover:text-ink",
};

const nightVariants: Record<ButtonVariant, string> = {
  solid: "bg-bone text-night hover:bg-paper",
  outline: "border border-night-rule text-bone hover:bg-bone hover:text-night",
  quiet: "border border-night-rule text-bone-muted hover:text-bone",
};

export function ButtonLink({
  href,
  children,
  variant = "solid",
  tone = "paper",
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  tone?: "paper" | "night";
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">) {
  const variants = tone === "night" ? nightVariants : buttonVariants;
  return (
    <Link href={href} className={cn(buttonBase, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "solid",
  tone = "paper",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  tone?: "paper" | "night";
} & ComponentPropsWithoutRef<"button">) {
  const variants = tone === "night" ? nightVariants : buttonVariants;
  return (
    <button
      className={cn(
        buttonBase,
        variants[variant],
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** The understated text link: clay, with a rule that fills on hover. */
export function TextLink({
  href,
  children,
  className,
  tone = "paper",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "night";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 border-b pb-1 text-2xs font-medium uppercase tracking-[0.14em] transition-colors duration-200",
        tone === "night"
          ? "border-night-rule text-bone hover:border-bone"
          : "border-rule text-clay hover:border-clay",
        className
      )}
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
