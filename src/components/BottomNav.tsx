"use client";

import { motion } from "framer-motion";
import { Home, Grid3X3, ShoppingBag, Info } from "lucide-react";

export type NavTab = "home" | "categories" | "cart" | "about";

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  cartCount: number;
}

const tabs: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "categories", label: "الأقسام", icon: Grid3X3 },
  { id: "cart", label: "السلة", icon: ShoppingBag },
  { id: "about", label: "عنّا", icon: Info },
];

export default function BottomNav({ active, onChange, cartCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="max-w-lg mx-auto px-3 pb-3">
        <div className="bg-teal-deep/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 px-2 py-2 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-olive-fresh/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    size={20}
                    className={isActive ? "text-olive-fresh" : "text-white/50"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {tab.id === "cart" && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-amber-gold text-[9px] font-bold text-teal-deep rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span
                  className={`relative text-[10px] font-arabic font-semibold ${
                    isActive ? "text-olive-fresh" : "text-white/50"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
