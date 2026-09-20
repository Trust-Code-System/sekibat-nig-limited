import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BLUR_DATA_URL, SIZES } from "@/lib/images";

/**
 * `ImageFrame` owns the aspect ratio and clipping, so no component threads width/height
 * through the data model and nothing shifts on load.
 */
export function ImageFrame({
  ratio = "aspect-[4/3]",
  className,
  children,
}: {
  ratio?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-ivory-deep", ratio, className)}>
      {children}
    </div>
  );
}

/**
 * Thin wrapper over next/image. `alt` is required — a decorative photograph still needs a
 * deliberate empty string, not an omission.
 */
export function SmartImage({
  src,
  alt,
  sizes = SIZES.card,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={cn("object-cover", className)}
    />
  );
}

/**
 * The editorial "plate": an image with a caption set in the margin below it. Hover scales the
 * image only — nothing else moves.
 */
export function Plate({
  src,
  alt,
  caption,
  ratio,
  sizes,
  priority,
  interactive = false,
  className,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <ImageFrame ratio={ratio}>
        <SmartImage
          src={src}
          alt={alt}
          sizes={sizes}
          priority={priority}
          className={
            interactive
              ? "transition-transform duration-700 ease-(--ease-editorial) group-hover:scale-[1.03]"
              : undefined
          }
        />
      </ImageFrame>
      {caption && (
        <figcaption className="label mt-4 flex items-center justify-between gap-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
