"use client";

import { useLenis } from "lenis/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { ArrowIcon } from "@/components/home/icons";
import { cn } from "@/lib/cn";
import { NAV, SITE } from "@/lib/site";

const HOME_NAV = [{ href: "/", label: "Home" }, ...NAV] as const;

const chip =
  "rounded-full bg-white/92 text-ink ring-1 ring-ink/10 backdrop-blur-md transition-[box-shadow,transform] duration-300 hover:ring-ink/16";

/**
 * Floating three-zone cinematic nav. Brand and Get Started sit in light chips
 * so they stay readable on dark mastheads and ivory pages alike.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;
  const [hiddenForPath, setHiddenForPath] = useState<string | null>(null);
  const hiddenPathRef = useRef<string | null>(null);
  const hidden = hiddenForPath === pathname;

  useLenis(
    (lenis) => {
      const currentlyHidden = hiddenPathRef.current === pathname;
      let next = currentlyHidden;
      if (open || lenis.scroll < 32) next = false;
      else if (lenis.direction === 1) next = true;
      else if (lenis.direction === -1) next = false;

      if (next !== currentlyHidden) {
        const nextPath = next ? pathname : null;
        hiddenPathRef.current = nextPath;
        setHiddenForPath(nextPath);
      }
    },
    [open, pathname]
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenForPath(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-editorial)]",
        hidden && !open ? "-translate-y-[120%]" : "translate-y-0"
      )}
    >
      <div className="pointer-events-auto mx-auto flex h-[88px] w-full max-w-(--container-site) items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className={cn("flex items-center py-1.5 pr-4 pl-1.5", chip)}
          aria-label={`${SITE.name}, home`}
        >
          <BrandLockup />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="cine-pill">
            {HOME_NAV.map((item, i) => (
              <li key={item.href} className="flex items-center">
                {i > 0 && <span className="cine-pill-rule" aria-hidden />}
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "px-3.5 py-1 text-[0.8125rem] transition-opacity duration-200",
                    isActive(item.href) ? "text-ivory" : "text-ivory/70 hover:text-ivory"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/contact" className={cn("group hidden items-center gap-2.5 py-1.5 pr-1.5 pl-4 md:flex", chip)}>
            <span className="text-sm font-medium">Get Started</span>
            <span className="cine-arrow-btn cine-arrow-btn-sm">
              <ArrowIcon />
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpenForPath(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className={cn("flex h-11 w-11 items-center justify-center lg:hidden", chip)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="relative block h-3 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-ink transition-transform duration-300",
                  open ? "top-1.5 rotate-45" : "top-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-ink transition-transform duration-300",
                  open ? "top-1.5 -rotate-45" : "top-3"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="pointer-events-auto border-t border-rule bg-ivory"
      >
        <nav aria-label="Primary mobile">
          <ul className="px-6 py-4">
            {HOME_NAV.map((item) => (
              <li key={item.href} className="border-b border-rule last:border-b-0">
                <Link
                  href={item.href}
                  onClick={() => setOpenForPath(null)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block py-5 text-d3 font-medium tracking-[-0.03em]",
                    isActive(item.href) ? "text-lime-deep" : "text-ink"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-6 pb-8">
            {pathname !== "/contact" && (
              <Link
                href="/contact"
                onClick={() => setOpenForPath(null)}
                className="group inline-flex items-center gap-3"
              >
                <span className="cine-arrow-btn cine-arrow-btn-sm">
                  <ArrowIcon />
                </span>
                <span className="text-sm font-medium">Get Started</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
