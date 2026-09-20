import { cn } from "@/lib/cn";

/** Orange plot-grid mark plus a Fraunces italic wordmark. */
export function BrandLockup({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark className={markClassName} />
      <span className="font-display text-[1.35rem] leading-none font-normal tracking-[-0.03em] italic">
        Sekibat
      </span>
    </span>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect width="40" height="40" rx="11" fill="#ff8618" />
      <rect x="8" y="8" width="11" height="11" rx="2.5" fill="#f4f1e9" />
      <rect x="21" y="8" width="11" height="11" rx="2.5" fill="#f4f1e9" opacity="0.45" />
      <rect x="8" y="21" width="11" height="11" rx="2.5" fill="#f4f1e9" opacity="0.45" />
      <rect x="21" y="21" width="11" height="11" rx="2.5" fill="#f4f1e9" />
    </svg>
  );
}
