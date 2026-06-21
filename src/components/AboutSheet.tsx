"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Instagram,
  ExternalLink,
  Leaf,
  Dumbbell,
  Heart,
} from "lucide-react";
import type { Restaurant } from "@/lib/types";

interface AboutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export default function AboutSheet({ isOpen, onClose, restaurant }: AboutSheetProps) {
  const mapEmbed = restaurant.latitude && restaurant.longitude
    ? `https://maps.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=15&output=embed`
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-cream"
          >
            <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur-lg px-5 pt-4 pb-3 border-b border-teal-forest/5 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-teal-forest">
                  عنّا
                </h2>
                <p className="text-xs text-teal-forest/40 font-latin">
                  About Spirito Vita
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-teal-forest/5 flex items-center justify-center"
              >
                <X size={18} className="text-teal-forest" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-5 pb-28">
              {/* Philosophy */}
              <div className="bg-gradient-to-br from-teal-forest to-teal-deep rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-olive-fresh/10 rounded-full blur-2xl" />
                <p className="text-olive-fresh text-xs font-latin tracking-[0.15em] uppercase mb-2">
                  SHIFT YOUR PERSPECTIVE
                </p>
                <p className="font-heading font-bold text-lg mb-2">
                  {restaurant.taglineAr}
                </p>
                <p className="text-white/70 text-sm font-arabic leading-relaxed">
                  {restaurant.descriptionAr}
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Leaf, label: "طعام صحي", color: "text-olive-fresh" },
                  { icon: Dumbbell, label: "كورس رياضي", color: "text-amber-gold" },
                  { icon: Heart, label: "قيمة غذائية", color: "text-red-400" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-white rounded-xl p-3 text-center shadow-sm border border-teal-forest/5"
                  >
                    <f.icon size={20} className={`${f.color} mx-auto mb-1.5`} />
                    <span className="text-[10px] font-arabic font-semibold text-teal-forest">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Map */}
              {mapEmbed && (
                <div className="rounded-2xl overflow-hidden shadow-card border border-teal-forest/5">
                  <iframe
                    src={mapEmbed}
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="موقع المطعم"
                  />
                  <a
                    href={restaurant.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 bg-white text-teal-forest font-arabic text-sm font-semibold hover:bg-teal-forest/5 transition-colors"
                  >
                    <ExternalLink size={14} />
                    فتح في خرائط Google
                  </a>
                </div>
              )}

              {/* Contact */}
              <div className="bg-white rounded-2xl p-4 shadow-card border border-teal-forest/5 space-y-3">
                <h3 className="font-heading font-bold text-teal-forest mb-1">
                  تواصل معنا
                </h3>

                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-cream hover:bg-teal-forest/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-forest/10 flex items-center justify-center">
                    <Phone size={18} className="text-teal-forest" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-forest/40 font-arabic">اتصل بنا</p>
                    <p className="font-bold text-teal-forest" dir="ltr">
                      {restaurant.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${restaurant.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-cream hover:bg-green-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <MessageCircle size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-forest/40 font-arabic">واتساب</p>
                    <p className="font-bold text-green-600 font-arabic">راسلنا الآن</p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-cream">
                  <div className="w-10 h-10 rounded-xl bg-amber-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-amber-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-forest/40 font-arabic">العنوان</p>
                    <p className="font-semibold text-teal-forest text-sm font-arabic">
                      {restaurant.address}
                    </p>
                  </div>
                </div>

                {restaurant.hours && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-cream">
                    <div className="w-10 h-10 rounded-xl bg-olive-fresh/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-olive-fresh" />
                    </div>
                    <div>
                      <p className="text-xs text-teal-forest/40 font-arabic">أوقات العمل</p>
                      <p className="font-semibold text-teal-forest text-sm font-arabic">
                        {restaurant.hours}
                      </p>
                    </div>
                  </div>
                )}

                {restaurant.instagram && (
                  <a
                    href={restaurant.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-cream hover:bg-pink-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                      <Instagram size={18} className="text-pink-600" />
                    </div>
                    <div>
                      <p className="text-xs text-teal-forest/40 font-arabic">انستغرام</p>
                      <p className="font-bold text-pink-600 font-arabic">تابعنا</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
