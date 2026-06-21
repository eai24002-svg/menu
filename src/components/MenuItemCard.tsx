"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { getItemImage } from "@/lib/food-images";
import { useCart } from "@/context/CartContext";
import NutritionBadge from "@/components/NutritionBadge";

interface MenuItemCardProps {
  item: MenuItem;
  categoryId: string;
  index: number;
  onTap?: (item: MenuItem) => void;
  variant?: "list" | "grid";
}

export default function MenuItemCard({
  item,
  categoryId,
  index,
  onTap,
  variant = "list",
}: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.item.id === item.id);
  const quantity = cartItem?.quantity ?? 0;
  const image = getItemImage(item.id, categoryId, item.image);

  if (variant === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.04 }}
        className="bg-white rounded-2xl overflow-hidden shadow-card border border-teal-forest/5"
      >
        <button onClick={() => onTap?.(item)} className="w-full text-right">
          <div className="relative aspect-square">
            <Image
              src={image}
              alt={item.nameAr}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 50vw, 200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-2 right-2 left-2">
              <NutritionBadge
                calories={item.calories}
                carbs={item.carbs}
                protein={item.protein}
                fats={item.fats}
              />
            </div>
            <span className="absolute bottom-2 right-2 font-numeric text-white text-sm crisp-text">
              {formatPrice(item.price)}
            </span>
          </div>
          <div className="p-3">
            <h3 className="font-heading font-bold text-teal-forest text-sm leading-tight line-clamp-2">
              {item.nameAr}
            </h3>
            <p className="text-[10px] text-teal-forest/40 font-latin mt-0.5 truncate">
              {item.nameEn}
            </p>
            {item.descriptionAr && (
              <p className="text-[10px] text-teal-forest/50 font-arabic mt-1 line-clamp-2 leading-relaxed">
                {item.descriptionAr}
              </p>
            )}
          </div>
        </button>
        <div className="px-3 pb-3">
          {quantity === 0 ? (
            <button
              onClick={() => addItem(item, categoryId)}
              className="w-full py-2 rounded-xl bg-olive-fresh/10 text-olive-dark font-arabic text-xs font-bold flex items-center justify-center gap-1 hover:bg-olive-fresh/20 transition-colors"
            >
              <Plus size={14} />
              أضف
            </button>
          ) : (
            <div className="flex items-center justify-between bg-teal-forest/5 rounded-xl px-2 py-1">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold text-sm text-teal-forest">{quantity}</span>
              <button
                onClick={() => addItem(item, categoryId)}
                className="w-7 h-7 rounded-lg bg-olive-fresh text-white flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileTap={{ scale: 0.99 }}
      className="bg-white rounded-2xl overflow-hidden shadow-card border border-teal-forest/5 flex"
    >
      <button
        onClick={() => onTap?.(item)}
        className="relative w-28 h-28 flex-shrink-0"
      >
        <Image
          src={image}
          alt={item.nameAr}
          fill
          className="object-cover"
          sizes="112px"
        />
      </button>

      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <button onClick={() => onTap?.(item)} className="text-right flex-1">
          <h3 className="font-heading font-bold text-teal-forest text-sm leading-tight line-clamp-2">
            {item.nameAr}
          </h3>
          <p className="text-[10px] text-teal-forest/40 font-latin mt-0.5 truncate">
            {item.nameEn}
          </p>
          {item.descriptionAr && (
            <p className="text-[10px] text-teal-forest/50 font-arabic mt-1 line-clamp-2 leading-relaxed">
              {item.descriptionAr}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <NutritionBadge
              calories={item.calories}
              carbs={item.carbs}
              protein={item.protein}
              fats={item.fats}
            />
          </div>
          <p className="text-amber-gold font-numeric text-base mt-1 crisp-text">
            {formatPrice(item.price)}
          </p>
        </button>

        {quantity === 0 ? (
          <button
            onClick={() => addItem(item, categoryId)}
            className="self-end w-9 h-9 rounded-xl bg-gradient-to-br from-olive-fresh to-olive-dark text-white flex items-center justify-center shadow-md"
          >
            <Plus size={18} />
          </button>
        ) : (
          <div className="self-end flex items-center gap-2 bg-teal-forest/5 rounded-xl px-1.5 py-1">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"
            >
              <Minus size={14} />
            </button>
            <span className="font-bold text-sm text-teal-forest w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => addItem(item, categoryId)}
              className="w-7 h-7 rounded-lg bg-olive-fresh text-white flex items-center justify-center"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
