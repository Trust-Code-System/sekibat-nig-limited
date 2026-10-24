"use client";

// Adapted from React Bits Status Mark by David Haz (2026).
// https://reactbits.dev/micro/status-mark — see docs/REACT_BITS_LICENSE.md.
import { motion, useReducedMotion } from "motion/react";

export function StatusMark({ status }: { status: "running" | "done" | "failed" }) {
  const reduced = useReducedMotion();
  return (
    <motion.svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none"
      className="shrink-0" initial={false}
      animate={{ rotate: status === "running" && !reduced ? 360 : 0 }}
      transition={status === "running" && !reduced
        ? { duration: 1.1, ease: "linear", repeat: Infinity } : { duration: 0 }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity=".2" />
      <motion.circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" initial={false}
        animate={{ pathLength: status === "running" ? 0.65 : 1 }}
        transition={{ duration: reduced ? 0 : 0.25 }} />
      {status !== "running" && <motion.path
        key={status} d={status === "done" ? "M7.5 12.25 10.5 15.25 16.75 8.75" : "M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5"}
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 0.24, delay: reduced ? 0 : 0.12 }} />}
    </motion.svg>
  );
}
