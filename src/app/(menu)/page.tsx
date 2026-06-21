"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Sparkles, TrendingUp } from "lucide-react";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/Header";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import CartDrawer from "@/components/CartDrawer";
import AboutSheet from "@/components/AboutSheet";
import ItemDetailModal from "@/components/ItemDetailModal";
import BottomNav, { type NavTab } from "@/components/BottomNav";
import { AudioProvider, useAudio } from "@/components/AudioPlayer";
import { CartProvider, useCart } from "@/context/CartContext";
import type { MenuData, MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { getCategoryImage } from "@/lib/food-images";
import { getVisibleCategories } from "@/lib/menu-helpers";

function MenuApp({ data }: { data: MenuData }) {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(data.categories[0]?.id || "");
  const [cartOpen, setCartOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<{ item: MenuItem; categoryId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, totalPrice } = useCart();

  const sortedCategories = useMemo(
    () => getVisibleCategories([...data.categories].sort((a, b) => a.order - b.order)),
    [data.categories]
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return sortedCategories;
    return sortedCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.nameAr.includes(searchQuery) ||
            item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.descriptionAr?.includes(searchQuery)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [sortedCategories, searchQuery]);

  const featuredItems = useMemo(() => {
    const picks = ["m9", "b6", "p2", "sl8", "pz6", "h2"];
    const all = sortedCategories.flatMap((c) =>
      c.items.map((item) => ({ item, categoryId: c.id }))
    );
    return picks
      .map((id) => all.find((x) => x.item.id === id))
      .filter(Boolean) as { item: MenuItem; categoryId: string }[];
  }, [sortedCategories]);

  const handleTabChange = (tab: NavTab) => {
    if (tab === "cart") {
      setCartOpen(true);
      return;
    }
    if (tab === "about") {
      setAboutOpen(true);
      return;
    }
    setActiveTab(tab);
    setSelectedCategory(null);
    if (tab === "categories") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setActiveCategory(id);
    setActiveTab("categories");
    setSearchQuery("");
  };

  useEffect(() => {
    if (selectedCategory) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedCategory]);

  const currentCategory = sortedCategories.find((c) => c.id === selectedCategory);

  return (
    <>
      <div className="min-h-screen bg-cream hero-pattern pb-28">
        <Header
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          compact={activeTab !== "home"}
        />

        <AnimatePresence mode="wait">
          {/* HOME */}
          {activeTab === "home" && !searchQuery && !selectedCategory && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero */}
              <div className="relative -mt-1 mx-4 rounded-3xl overflow-hidden shadow-premium">
                <div className="relative h-44">
                  <Image
                    src={getCategoryImage("healthy")}
                    alt="روح الحياة"
                    fill
                    className="object-cover"
                    sizes="512px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-deep via-teal-deep/60 to-transparent" />
                  <div className="absolute bottom-0 right-0 left-0 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-amber-gold" />
                      <span className="text-amber-gold text-xs font-latin tracking-wider">
                        PREMIUM QUALITY
                      </span>
                    </div>
                    <h2 className="font-heading font-bold text-white text-xl text-shadow leading-tight">
                      {data.restaurant.taglineAr}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
                {[
                  { val: "93+", label: "طبق" },
                  { val: "10", label: "أقسام" },
                  { val: "100%", label: "صحي" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-xl p-3 text-center shadow-sm border border-teal-forest/5"
                  >
                    <p className="font-heading font-bold text-teal-forest text-lg">
                      {s.val}
                    </p>
                    <p className="text-[10px] text-teal-forest/40 font-arabic">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Featured */}
              <div className="px-4 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-olive-fresh" />
                    <h3 className="font-heading font-bold text-teal-forest">
                      الأكثر طلباً
                    </h3>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                  {featuredItems.map(({ item, categoryId }) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDetailItem({ item, categoryId })}
                      className="flex-shrink-0 w-36 bg-white rounded-2xl overflow-hidden shadow-card border border-teal-forest/5"
                    >
                      <div className="relative h-28">
                        <Image
                          src={getCategoryImage(categoryId)}
                          alt={item.nameAr}
                          fill
                          className="object-cover"
                          sizes="144px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-numeric text-white bg-olive-fresh/80 px-2 py-0.5 rounded-full crisp-text">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <p className="p-2 font-heading font-bold text-teal-forest text-xs line-clamp-2 text-right">
                        {item.nameAr}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Categories preview */}
              <div className="px-4 mt-6">
                <h3 className="font-heading font-bold text-teal-forest mb-3">
                  اختر القسم
                </h3>
                <CategoryGrid
                  categories={sortedCategories}
                  onSelect={handleCategorySelect}
                />
              </div>
            </motion.div>
          )}

          {/* CATEGORIES / MENU VIEW */}
          {(activeTab === "categories" || selectedCategory || searchQuery) && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4"
            >
              {selectedCategory && currentCategory && !searchQuery && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setActiveTab("home");
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                  className="flex items-center gap-2 text-teal-forest/60 font-arabic text-sm mb-4 mt-2"
                >
                  <ChevronLeft size={16} />
                  العودة للأقسام
                </button>
              )}

              {selectedCategory && currentCategory && !searchQuery ? (
                <>
                  <div className="relative h-36 rounded-2xl overflow-hidden mb-4 shadow-card">
                    <Image
                      src={getCategoryImage(currentCategory.id)}
                      alt={currentCategory.nameAr}
                      fill
                      className="object-cover"
                      sizes="512px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/80 to-transparent" />
                    <div className="absolute bottom-3 right-4">
                      <span className="text-3xl">{currentCategory.icon}</span>
                      <h2 className="font-heading font-bold text-white text-xl">
                        {currentCategory.nameAr}
                      </h2>
                      <p className="text-white/50 text-xs font-latin">
                        {currentCategory.nameEn}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {currentCategory.items.map((item, idx) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        categoryId={currentCategory.id}
                        index={idx}
                        variant="grid"
                        onTap={(i) =>
                          setDetailItem({ item: i, categoryId: currentCategory.id })
                        }
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {!searchQuery && (
                    <div className="mt-2 mb-4">
                      <CategoryNav
                        categories={sortedCategories}
                        activeCategory={activeCategory}
                        onSelect={(id) => {
                          setActiveCategory(id);
                          setSelectedCategory(id);
                        }}
                      />
                    </div>
                  )}

                  {searchQuery && (
                    <p className="font-arabic text-teal-forest/50 text-sm mt-2 mb-4">
                      نتائج البحث عن &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}

                  <div className="space-y-8 mt-4">
                    {filteredCategories.map((category) => (
                      <section key={category.id}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">{category.icon}</span>
                          <h2 className="font-heading font-bold text-lg text-teal-forest">
                            {category.nameAr}
                          </h2>
                        </div>
                        <div className="grid gap-3">
                          {category.items.map((item, idx) => (
                            <MenuItemCard
                              key={item.id}
                              item={item}
                              categoryId={category.id}
                              index={idx}
                              onTap={(i) =>
                                setDetailItem({ item: i, categoryId: category.id })
                              }
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                    {filteredCategories.length === 0 && (
                      <div className="text-center py-16">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="font-arabic text-teal-forest/50">لا توجد نتائج</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating cart */}
        <AnimatePresence>
          {totalItems > 0 && !cartOpen && (
            <motion.button
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={() => setCartOpen(true)}
              className="fixed bottom-24 left-4 right-4 z-30 max-w-lg mx-auto py-3.5 px-5 rounded-2xl bg-gradient-to-r from-olive-fresh to-olive-dark text-white flex items-center justify-between shadow-glow animate-glow-pulse"
            >
              <span className="font-arabic font-bold text-sm">
                🛒 {totalItems} عنصر في السلة
              </span>
              <span className="font-numeric crisp-text">{formatPrice(totalPrice)}</span>
            </motion.button>
          )}
        </AnimatePresence>

        <BottomNav
          active={aboutOpen ? "about" : cartOpen ? "cart" : activeTab}
          onChange={handleTabChange}
          cartCount={totalItems}
        />

        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          restaurant={data.restaurant}
        />

        <AboutSheet
          isOpen={aboutOpen}
          onClose={() => setAboutOpen(false)}
          restaurant={data.restaurant}
        />

        {detailItem && (
          <ItemDetailModal
            item={detailItem.item}
            categoryId={detailItem.categoryId}
            onClose={() => setDetailItem(null)}
          />
        )}
      </div>
    </>
  );
}

function AppContent() {
  const [data, setData] = useState<MenuData | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <AudioProvider musicUrl={data?.restaurant?.backgroundMusic}>
      <AppContentInner data={data} appReady={appReady} onComplete={() => setAppReady(true)} />
    </AudioProvider>
  );
}

function AppContentInner({
  data,
  appReady,
  onComplete,
}: {
  data: MenuData | null;
  appReady: boolean;
  onComplete: () => void;
}) {
  const { startFromGesture } = useAudio();

  if (!appReady || !data) {
    return (
      <SplashScreen
        dataReady={!!data}
        onEnter={startFromGesture}
        onComplete={onComplete}
      />
    );
  }

  return (
    <CartProvider>
      <MenuApp data={data} />
    </CartProvider>
  );
}

export default function HomePage() {
  return <AppContent />;
}
