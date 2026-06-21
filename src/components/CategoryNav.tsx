"use client";

import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export default function CategoryNav({
  categories,
  activeCategory,
  onSelect,
}: CategoryNavProps) {
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="sticky top-[108px] z-30 -mx-4 px-4 py-2 bg-cream/95 backdrop-blur-lg border-b border-teal-forest/5">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {sorted.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-heading font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-teal-forest to-teal-deep text-white shadow-md"
                  : "bg-white text-teal-forest/70 border border-teal-forest/10"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.nameAr}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
