"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { BLUR_DATA_URL, RATIO, SIZES } from "@/lib/images";

/**
 * Property gallery with a lightbox.
 *
 * Uses a native `<dialog>` with `showModal()`: that gives a real focus trap, top-layer
 * stacking, inert background and Escape-to-close from the platform, with no dependency and no
 * hand-rolled focus management to get subtly wrong.
 *
 * Keyboard contract: ← / → step, Home / End jump, Escape closes, focus returns to the trigger.
 * The thumbnail strip is a tablist-style roving selection.
 */
export function PropertyGallery({
  images,
  title,
  alt,
}: {
  images: string[];
  title: string;
  /** One alt string per image, same order. */
  alt: string[];
}) {
  const [index, setIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const count = images.length;
  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  const open = () => {
    setDialogOpen(true);
    dialogRef.current?.showModal();
  };

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Restore focus to the trigger when the dialog closes, however it was closed.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setDialogOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!dialogRef.current?.open) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setIndex(count - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, count]);

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className={cn(
          "group relative block w-full overflow-hidden rounded-2xl bg-ivory-deep",
          RATIO.gallery
        )}
      >
        <Image
          src={images[index]}
          alt={alt[index] ?? title}
          fill
          loading="eager"
          fetchPriority="high"
          sizes={SIZES.gallery}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover transition-transform duration-700 ease-(--ease-editorial) group-hover:scale-[1.02]"
        />
        <span className="absolute right-4 bottom-4 rounded-full bg-onyx/80 px-3 py-2 text-2xs tracking-[0.14em] text-ivory uppercase backdrop-blur-sm">
          Enlarge
        </span>
      </button>

      {count > 1 && (
        <ul className="mt-3 flex flex-wrap gap-3" role="list">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Show image ${i + 1} of ${count}`}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-xl bg-ivory-deep transition-opacity md:size-24",
                  i === index ? "opacity-100" : "opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes={SIZES.thumb}
                  className="object-cover"
                />
                {i === index && (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-lime" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${title}, photographs`}
        className="fixed inset-0 m-0 h-full max-h-full w-full max-w-full bg-night/97 p-0 backdrop:bg-night/80"
      >
        <div className="on-night flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-5 md:px-10">
            <p className="label font-mono text-bone-muted">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={close}
              className="text-2xs tracking-[0.14em] text-bone uppercase transition-colors hover:text-clay"
            >
              Close
            </button>
          </div>

          <div className="relative flex-1">
            {dialogOpen && (
              <Image
                src={images[index]}
                alt={alt[index] ?? title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-6 px-6 py-5 md:px-10">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={count < 2}
              className="text-2xs tracking-[0.14em] text-bone uppercase transition-colors hover:text-clay disabled:opacity-40"
            >
              ← Previous
            </button>
            <p className="label text-bone-muted">{title}</p>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={count < 2}
              className="text-2xs tracking-[0.14em] text-bone uppercase transition-colors hover:text-clay disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
