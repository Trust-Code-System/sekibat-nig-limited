"use client";

import { gsap } from "gsap";
import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Weighted smooth scroll for the whole document. Lenis drives its RAF through
 * the GSAP ticker so sticky/scrubbed scenes stay in lockstep. Honours
 * `prefers-reduced-motion` on its own and falls back to native scroll.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.08,
        wheelMultiplier: 0.88,
        anchors: true,
        allowNestedScroll: true,
        prevent: (node) =>
          Boolean(
            node.closest("[data-lenis-prevent], [data-lenis-prevent-wheel]")
          ),
      }}
    >
      {children}
    </ReactLenis>
  );
}
