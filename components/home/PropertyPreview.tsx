"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { RubberSegment } from "@/components/motion/RubberSegment";
import { HomePropertyCard } from "@/components/home/HomePropertyCard";
import type { Property } from "@/types";

const categories = [
  { value: "all", label: "All spaces" },
  { value: "residential", label: "Homes" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

export function PropertyPreview({ properties }: { properties: Property[] }) {
  const [category, setCategory] = useState("all");
  const reduced = useReducedMotion();
  const visible = properties.filter((property) => category === "all" || property.type === category);
  const options = categories.filter((item) => item.value === "all" || properties.some((p) => p.type === item.value));
  return <>
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <RubberSegment items={options} value={category} onChange={setCategory} label="Explore property types" />
      <p role="status" className="label">{visible.length} {visible.length === 1 ? "space" : "spaces"} to explore</p>
    </div>
    <motion.div layout={!reduced} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map((property, i) => <motion.div key={property.id} layout={!reduced}
          initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
          transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : Math.min(i, 3) * 0.035,
            layout: { type: "spring", duration: 0.4, bounce: 0 } }}>
          <HomePropertyCard property={property} priority={i < 2} />
        </motion.div>)}
      </AnimatePresence>
    </motion.div>
  </>;
}
