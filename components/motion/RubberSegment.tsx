"use client";

// Adapted from React Bits Rubber Segment by David Haz (2026).
// https://reactbits.dev/micro/rubber-segment — see docs/REACT_BITS_LICENSE.md.
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, type KeyboardEvent } from "react";

type Item = { value: string; label: string };
const spring = { type: "spring" as const, duration: 0.32, bounce: 0.12 };

/** Independent leading/trailing edges stretch the selection before it settles. */
export function RubberSegment({ items, value, onChange, label }: {
  items: Item[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const width = useMotionValue(0);
  const reduced = useReducedMotion();
  const selected = Math.max(0, items.findIndex((item) => item.value === value));
  const clipPath = useTransform(() =>
    `inset(0 ${Math.max(0, width.get() - right.get())}px 0 ${left.get()}px round 999px)`
  );

  useEffect(() => {
    const node = root.current;
    const button = controls.current[selected];
    if (!node || !button) return;
    const bounds = () => ({ l: button.offsetLeft, r: button.offsetLeft + button.offsetWidth });
    const measure = () => {
      width.jump(node.clientWidth);
      const next = bounds();
      left.jump(next.l);
      right.jump(next.r);
    };
    width.set(node.clientWidth);
    const next = bounds();
    const animations: { stop: () => void }[] = [];
    if (reduced || right.get() === 0) {
      left.jump(next.l);
      right.jump(next.r);
    } else {
      // Lead first; the trailing edge catches up to create the rubber stretch.
      const goingRight = next.l > left.get();
      animations.push(animate(left, next.l, { ...spring, delay: goingRight ? 0.045 : 0 }));
      animations.push(animate(right, next.r, { ...spring, delay: goingRight ? 0 : 0.045 }));
    }
    // ResizeObserver's initial notification must not interrupt this selection's spring.
    let initial = true;
    const resize = new ResizeObserver(() => {
      if (initial) { initial = false; return; }
      measure();
    });
    resize.observe(node);
    return () => {
      resize.disconnect();
      animations.forEach((animation) => animation.stop());
    };
  }, [selected, reduced, left, right, width]);

  function onKey(event: KeyboardEvent<HTMLButtonElement>) {
    const last = items.length - 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? last
      : event.key === "ArrowRight" || event.key === "ArrowDown" ? (selected + 1) % items.length
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (selected + last) % items.length : null;
    if (next === null) return;
    event.preventDefault();
    onChange(items[next].value);
    controls.current[next]?.focus();
  }

  return (
    <div ref={root} role="radiogroup" aria-label={label} className="rubber-segment">
      {items.map((item, i) => (
        <button key={item.value} ref={(node) => { controls.current[i] = node; }}
          type="button" role="radio" aria-checked={i === selected} tabIndex={i === selected ? 0 : -1}
          onClick={() => onChange(item.value)} onKeyDown={onKey}>
          {item.label}
        </button>
      ))}
      <motion.div aria-hidden className="rubber-segment-selection" style={{ clipPath }}>
        {items.map((item) => <span key={item.value}>{item.label}</span>)}
      </motion.div>
    </div>
  );
}
