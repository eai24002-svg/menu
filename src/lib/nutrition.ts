import { formatNumber } from "@/lib/format";

export interface ItemNutrition {
  calories?: number;
  carbs?: number;
  protein?: number;
  fats?: number;
}

export function formatGrams(value?: number): string {
  if (value === undefined || value === null) return "—";
  return `${formatNumber(value)} غ`;
}

export function formatCalories(calories?: number): string {
  if (!calories) return "—";
  return `${formatNumber(calories)} سعرة`;
}

export function hasNutrition(n: ItemNutrition): boolean {
  return !!(n.calories || n.carbs || n.protein || n.fats);
}
