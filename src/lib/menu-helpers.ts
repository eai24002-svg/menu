import type { Category } from "@/lib/types";

export function getVisibleCategories(categories: Category[]): Category[] {
  return categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.available),
    }))
    .filter((cat) => cat.items.length > 0);
}
