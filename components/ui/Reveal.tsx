"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll reveal. Opacity and a 12px rise, nothing else — the motion rule in STYLESEED.md.
 *
 * Fails safe, in this order:
 *   - Server-renders VISIBLE, so content exists without JavaScript and for crawlers.
 *   - On mount, anything already at or near the viewport shows immediately and is never
 *     hidden — hiding content the reader can already see is a bug, not an animation.
 *   - Only below-the-fold elements are armed (hidden) and wait for the observer.
 *   - `prefers-reduced-motion` skips the whole mechanism.
 *
 * A previous version armed everything on mount, which left content invisible whenever the
 * observer did not fire. Do not reintroduce that.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  /** Stagger in ms. Keep to multiples of 60 across a row. */
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already visible (or nearly) — leave it alone.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(armed && "reveal", armed && shown && "reveal-in", className)}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
