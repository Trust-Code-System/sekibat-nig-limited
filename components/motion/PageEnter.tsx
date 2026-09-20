"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Soft route entrance. Content still server-renders visible; this only lifts it
 * once the client hydrates. Reduced-motion users get the static page.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.animate(
      [
        { opacity: 0.72, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 700, easing: "cubic-bezier(0.2, 0.6, 0.2, 1)", fill: "both" }
    );
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
