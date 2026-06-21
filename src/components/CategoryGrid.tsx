"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Category } from "@/lib/types";
import { getCategoryImage } from "@/lib/food-images";

interface CategoryGridProps {
  categories: Category[];
  onSelect: (id: string) => void;
}

export default function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-2 gap-3">
      {sorted.map((cat, i) => {
        const img = cat.image || getCategoryImage(cat.id);
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(cat.id)}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-card"
          >
            <Image
              src={img}
              alt={cat.nameAr}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 512px) 50vw, 256px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/90 via-teal-deep/40 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-3 text-right">
              <span className="text-2xl mb-1 block">{cat.icon}</span>
              <h3 className="font-heading font-bold text-white text-sm leading-tight">
                {cat.nameAr}
              </h3>
              <p className="text-white/50 text-[10px] font-latin tracking-wide mt-0.5">
                {cat.nameEn}
              </p>
              <span className="inline-block mt-1.5 text-[10px] bg-olive-fresh/80 text-white px-2 py-0.5 rounded-full font-arabic">
                {cat.items.filter((i) => i.available).length} طبق
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
