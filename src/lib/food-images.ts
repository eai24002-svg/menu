const CATEGORY_IMAGES: Record<string, string> = {
  burgers: "/images/categories/burgers.jpg",
  soup: "/images/categories/soup.jpg",
  sides: "/images/categories/sides.jpg",
  pasta: "/images/categories/pasta.jpg",
  salads: "/images/categories/salads.jpg",
  main: "/images/categories/main.jpg",
  sandwiches: "/images/categories/sandwiches.jpg",
  pizza: "/images/categories/pizza.jpg",
  healthy: "/images/categories/healthy.jpg",
  desserts: "/images/categories/desserts.jpg",
};

const ITEM_OVERRIDES: Record<string, string> = {
  m1: "/images/categories/main.jpg",
  m8: "/images/categories/main.jpg",
  m9: "/images/categories/main.jpg",
  p2: "/images/categories/pasta.jpg",
  pz6: "/images/categories/pizza.jpg",
  sl8: "/images/categories/salads.jpg",
  d1: "/images/categories/desserts.jpg",
  d2: "/images/categories/desserts.jpg",
  b6: "/images/categories/burgers.jpg",
};

export function getCategoryImage(categoryId: string): string {
  return CATEGORY_IMAGES[categoryId] ?? CATEGORY_IMAGES.main;
}

export function getItemImage(itemId: string, categoryId: string, customImage?: string): string {
  if (customImage) return customImage;
  if (ITEM_OVERRIDES[itemId]) return ITEM_OVERRIDES[itemId];
  return getCategoryImage(categoryId);
}
