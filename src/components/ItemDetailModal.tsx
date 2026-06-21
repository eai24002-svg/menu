"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { getItemImage } from "@/lib/food-images";
import { useCart } from "@/context/CartContext";
import NutritionBadge from "@/components/NutritionBadge";

interface ItemDetailModalProps {
  item: MenuItem | null;
  categoryId: string;
  onClose: () => void;
}

export default function ItemDetailModal({
  item,
  categoryId,
  onClose,
}: ItemDetailModalProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = item ? items.find((i) => i.item.id === item.id) : null;
  const quantity = cartItem?.quantity ?? 0;

  if (!item) return null;

  const image = getItemImage(item.id, categoryId, item.image);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[60] max-w-lg mx-auto"
      >
        <div className="bg-cream rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="relative h-56 sm:h-64 flex-shrink-0">
            <Image
              src={image}
              alt={item.nameAr}
              fill
              className="object-cover"
              sizes="512px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/80 via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <p className="text-olive-fresh text-xs font-latin tracking-wider uppercase mb-1">
              {item.nameEn}
            </p>
            <h2 className="font-heading font-bold text-2xl text-teal-forest mb-3">
              {item.nameAr}
            </h2>
            <NutritionBadge
              calories={item.calories}
              carbs={item.carbs}
              protein={item.protein}
              fats={item.fats}
              size="md"
              variant="grid"
            />
            {item.descriptionAr && (
              <p className="text-teal-forest/60 text-sm font-arabic leading-relaxed mb-4 mt-4">
                {item.descriptionAr}
              </p>
            )}
            <p className="font-numeric text-2xl text-amber-gold mb-6 crisp-text">
              {formatPrice(item.price)}
            </p>

            <div className="flex items-center gap-4">
              {quantity === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addItem(item, categoryId)}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-olive-fresh to-olive-dark text-white font-arabic font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag size={20} />
                  أضف للسلة
                </motion.button>
              ) : (
                <div className="flex-1 flex items-center justify-between bg-white rounded-2xl p-2 shadow-card">
                  <button
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="w-12 h-12 rounded-xl bg-teal-forest/5 flex items-center justify-center"
                  >
                    <Minus size={20} className="text-teal-forest" />
                  </button>
                    <span className="font-numeric text-2xl text-teal-forest">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addItem(item, categoryId)}
                    className="w-12 h-12 rounded-xl bg-olive-fresh text-white flex items-center justify-center"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
