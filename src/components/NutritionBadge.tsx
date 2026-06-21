import { Flame, Wheat, Beef, Droplet } from "lucide-react";
import type { ItemNutrition } from "@/lib/nutrition";
import { hasNutrition } from "@/lib/nutrition";
import { formatNumber } from "@/lib/format";

interface NutritionBadgeProps extends ItemNutrition {
  size?: "sm" | "md";
  variant?: "inline" | "grid";
}

export default function NutritionBadge({
  calories,
  carbs,
  protein,
  fats,
  size = "sm",
  variant = "inline",
}: NutritionBadgeProps) {
  if (!hasNutrition({ calories, carbs, protein, fats })) return null;

  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const iconSize = size === "sm" ? 10 : 12;
  const pad = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";

  const items = [
    { icon: Flame, label: "سعرات", value: calories, suffix: "" },
    { icon: Wheat, label: "كرب", value: carbs, suffix: "غ" },
    { icon: Beef, label: "برو", value: protein, suffix: "غ" },
    { icon: Droplet, label: "دهون", value: fats, suffix: "غ" },
  ].filter((item) => item.value !== undefined && item.value !== null);

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map(({ icon: Icon, label, value, suffix }) => (
          <div
            key={label}
            className="rounded-xl bg-white border border-teal-forest/10 p-3 text-center shadow-sm"
          >
            <Icon size={16} className="mx-auto text-amber-gold mb-1" />
            <p className="text-[10px] text-teal-forest/50 font-arabic">{label}</p>
            <p className={`font-numeric text-teal-forest ${textSize}`}>
              {formatNumber(value!)}
              {suffix && <span className="text-teal-forest/50 font-arabic text-[10px]"> {suffix}</span>}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map(({ icon: Icon, label, value, suffix }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1 bg-amber-gold/10 text-amber-gold font-numeric rounded-full ${pad} ${textSize} crisp-text`}
          title={label}
        >
          <Icon size={iconSize} />
          {formatNumber(value!)}
          {suffix}
        </span>
      ))}
    </div>
  );
}
