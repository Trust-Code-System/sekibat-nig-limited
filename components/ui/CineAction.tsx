import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "@/components/home/icons";
import { cn } from "@/lib/cn";

export function CineAction({
  href,
  children,
  caption,
  invert = false,
  className,
}: {
  href: string;
  children: ReactNode;
  caption?: string;
  invert?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-4", className)}>
      <span className="cine-arrow-btn cine-arrow-btn-sm">
        <ArrowIcon />
      </span>
      <span className="text-left">
        <span
          className={cn(
            "block text-sm font-medium",
            invert ? "text-ivory" : "text-ink"
          )}
        >
          {children}
        </span>
        {caption && (
          <span
            className={cn(
              "mt-0.5 block text-xs",
              invert ? "text-ivory/60" : "text-ink-muted"
            )}
          >
            {caption}
          </span>
        )}
      </span>
    </Link>
  );
}
