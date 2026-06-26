import { formatPrice as formatPriceValue } from "@/lib/format";

export interface MenuItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  calories?: number;
  carbs?: number;
  protein?: number;
  fats?: number;
  price: number;
  available: boolean;
  image?: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  order: number;
  image?: string;
  items: MenuItem[];
}

export interface Restaurant {
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  hours?: string;
  mapUrl?: string;
  mapPlaceId?: string;
  latitude?: number;
  longitude?: number;
  backgroundMusic?: string;
}

export interface MenuData {
  restaurant: Restaurant;
  categories: Category[];
}

export interface CartItem {
  item: MenuItem;
  categoryId: string;
  quantity: number;
  note?: string;
}

export { formatPrice, formatNumber } from "@/lib/format";
export { formatCalories, formatGrams } from "@/lib/nutrition";

export function buildWhatsAppMessage(
  items: CartItem[],
  customerNote: string,
  tableNumber: string,
  restaurantName: string
): string {
  let message = `🍽️ *طلب جديد من ${restaurantName}*\n`;
  message += "━━━━━━━━━━━━━━━━\n\n";

  if (tableNumber.trim()) {
    message += `📍 *رقم الطاولة:* ${tableNumber}\n\n`;
  }

  let total = 0;
  items.forEach((cartItem, index) => {
    const subtotal = cartItem.item.price * cartItem.quantity;
    total += subtotal;
    message += `${index + 1}. *${cartItem.item.nameAr}*\n`;
    message += `   الكمية: ${cartItem.quantity} × ${formatPriceValue(cartItem.item.price)}\n`;
    message += `   المجموع: ${formatPriceValue(subtotal)}\n`;
    if (cartItem.note) {
      message += `   📝 ملاحظة: ${cartItem.note}\n`;
    }
    message += "\n";
  });

  message += "━━━━━━━━━━━━━━━━\n";
  message += `💰 *المجموع الكلي:* ${formatPriceValue(total)}\n`;

  if (customerNote.trim()) {
    message += `\n📋 *ملاحظات إضافية:*\n${customerNote}\n`;
  }

  message += "\n✨ شكراً لاختياركم روح الحياة!";
  return message;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}
