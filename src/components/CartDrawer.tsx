"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice, buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/types";
import type { Restaurant } from "@/lib/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export default function CartDrawer({ isOpen, onClose, restaurant }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const message = buildWhatsAppMessage(
      items,
      customerNote,
      tableNumber,
      restaurant.nameAr
    );
    const url = getWhatsAppUrl(restaurant.whatsapp, message);
    window.open(url, "_blank");
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-teal-forest/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-teal-forest/5 bg-gradient-to-l from-teal-forest/5 to-transparent">
              <h2 className="font-heading font-bold text-xl text-teal-forest">
                🛒 سلة الطلبات
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-teal-forest/5 flex items-center justify-center"
              >
                <X size={18} className="text-teal-forest" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🍽️</p>
                  <p className="font-arabic text-teal-forest/50">السلة فارغة</p>
                  <p className="font-arabic text-teal-forest/30 text-sm mt-1">
                    اختر أطباقك المفضلة من القائمة
                  </p>
                </div>
              ) : (
                items.map((cartItem) => (
                  <motion.div
                    key={cartItem.item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-cream rounded-2xl p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-arabic font-bold text-teal-forest">
                          {cartItem.item.nameAr}
                        </h4>
                        <p className="text-amber-gold font-numeric text-sm mt-1 crisp-text">
                          {formatPrice(cartItem.item.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(cartItem.item.id)}
                        className="text-red-400 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 bg-white rounded-xl px-2 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                          }
                          className="w-8 h-8 rounded-lg bg-teal-forest/5 flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-numeric text-teal-forest w-6 text-center crisp-text">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(cartItem.item.id, cartItem.quantity + 1)
                          }
                          className="w-8 h-8 rounded-lg bg-olive-fresh text-white flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-numeric text-teal-forest crisp-text">
                        {formatPrice(cartItem.item.price * cartItem.quantity)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-teal-forest/5 px-5 py-4 space-y-3 bg-white">
                <input
                  type="text"
                  placeholder="رقم الطاولة (اختياري)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cream border border-teal-forest/10 font-arabic text-sm focus:outline-none focus:border-olive-fresh"
                />
                <textarea
                  placeholder="ملاحظات إضافية (اختياري)"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-cream border border-teal-forest/10 font-arabic text-sm focus:outline-none focus:border-olive-fresh resize-none"
                />

                <div className="flex justify-between items-center py-2">
                  <span className="font-arabic font-bold text-teal-forest">المجموع</span>
                  <span className="font-numeric text-xl text-amber-gold crisp-text">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleWhatsAppOrder}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-arabic font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
                >
                  <MessageCircle size={22} />
                  إرسال الطلب عبر واتساب
                </motion.button>

                <div className="flex items-center justify-center gap-4 pt-2 text-teal-forest/40">
                  <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 text-xs">
                    <Phone size={12} />
                    {restaurant.phone}
                  </a>
                  <span className="flex items-center gap-1 text-xs">
                    <MapPin size={12} />
                    {restaurant.address}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
