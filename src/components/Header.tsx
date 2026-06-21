"use client";

import Image from "next/image";
import { Search } from "lucide-react";

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  compact?: boolean;
}

export default function Header({
  onSearchChange,
  searchQuery,
  compact = false,
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 ${
        compact
          ? "bg-cream/90 backdrop-blur-xl"
          : "bg-gradient-to-b from-teal-deep to-teal-forest"
      }`}
    >
      <div className={`px-4 ${compact ? "py-2" : "pt-4 pb-5"}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/10 p-1 flex-shrink-0">
            <Image
              src="/logo-en.png"
              alt="Spirito Vita"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div className="flex-1">
            <h1
              className={`font-heading font-bold text-lg leading-tight ${
                compact ? "text-teal-forest" : "text-white"
              }`}
            >
              روح الحياة
            </h1>
            <p
              className={`text-[10px] font-latin tracking-[0.15em] uppercase ${
                compact ? "text-teal-forest/40" : "text-olive-fresh/80"
              }`}
            >
              Spirito Vita • Healthy Food
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${
              compact ? "text-teal-forest/30" : "text-white/40"
            }`}
          />
          <input
            type="text"
            placeholder="ابحث عن طبقك المفضل..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pr-10 pl-4 py-2.5 rounded-xl font-arabic text-sm focus:outline-none transition-all ${
              compact
                ? "bg-white border border-teal-forest/10 focus:border-olive-fresh/50 focus:ring-2 focus:ring-olive-fresh/10"
                : "bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/20"
            }`}
          />
        </div>
      </div>
    </header>
  );
}
