"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Home,
  Settings,
  Utensils,
  Search,
  Flame,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import type { MenuData, MenuItem, Category } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { getItemImage } from "@/lib/food-images";
import ImageUploader from "@/components/ImageUploader";
import AudioUploader from "@/components/AudioUploader";
import NutritionBadge from "@/components/NutritionBadge";
import { v4 as uuidv4 } from "uuid";

function makeCategoryId(nameEn: string, existing: string[]): string {
  const base =
    nameEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  let id = base;
  let n = 1;
  while (existing.includes(id)) {
    id = `${base}-${n++}`;
  }
  return id;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [data, setData] = useState<MenuData | null>(null);
  const [activeTab, setActiveTab] = useState<"items" | "categories" | "overview" | "settings">("items");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchMenu = useCallback(async () => {
    const res = await fetch("/api/menu");
    const json = await res.json();
    setData(json);
    if (json.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(json.categories[0].id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved) {
      setAdminPassword(saved);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchMenu();
  }, [isLoggedIn, fetchMenu]);

  const stats = useMemo(() => {
    if (!data) return { items: 0, categories: 0, hidden: 0, avgCal: 0 };
    const all = data.categories.flatMap((c) => c.items);
    const withCal = all.filter((i) => i.calories);
    const avgCal = withCal.length
      ? Math.round(withCal.reduce((s, i) => s + (i.calories || 0), 0) / withCal.length)
      : 0;
    return {
      items: all.length,
      categories: data.categories.length,
      hidden: all.filter((i) => !i.available).length,
      online: all.filter((i) => i.available).length,
      avgCal,
    };
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!data || !selectedCategory) return [];
    const cat = data.categories.find((c) => c.id === selectedCategory);
    if (!cat) return [];
    if (!searchQuery.trim()) return cat.items;
    const q = searchQuery.toLowerCase();
    return cat.items.filter(
      (i) =>
        i.nameAr.includes(searchQuery) ||
        i.nameEn.toLowerCase().includes(q) ||
        i.descriptionAr?.includes(searchQuery)
    );
  }, [data, selectedCategory, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAdminPassword(password);
      sessionStorage.setItem("admin-auth", password);
      setIsLoggedIn(true);
      showMsg("تم تسجيل الدخول بنجاح");
    } else {
      showMsg("كلمة المرور غير صحيحة");
    }
    setLoading(false);
  };

  const apiCall = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/menu/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await fetchMenu();
      return true;
    }
    showMsg("حدث خطأ");
    return false;
  };

  const handleSaveItem = async () => {
    if (!editingItem || !selectedCategory) return;
    if (!editingItem.descriptionAr?.trim()) {
      showMsg("يرجى إضافة وصف للطبق");
      return;
    }
    const isNew = !data?.categories
      .flatMap((c) => c.items)
      .find((i) => i.id === editingItem.id);

    await apiCall({
      action: isNew ? "addItem" : "updateItem",
      categoryId: selectedCategory,
      item: editingItem,
    });
    setEditingItem(null);
    showMsg(isNew ? "تمت الإضافة" : "تم التحديث");
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`هل تريد حذف "${item.nameAr}"؟`)) return;
    await apiCall({ action: "deleteItem", item });
    showMsg("تم الحذف");
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    const next = !item.available;
    const ok = await apiCall({
      action: "updateItem",
      item: { ...item, available: next },
    });
    if (ok) {
      showMsg(next ? "تم تفعيل الطبق في المنيو" : "تم إخفاء الطبق من المنيو");
    }
  };

  const handleSaveRestaurant = async () => {
    if (!data) return;
    await apiCall({ action: "updateRestaurant", restaurant: data.restaurant });
    showMsg("تم حفظ الإعدادات");
  };

  const newItemDefaults = (): MenuItem => ({
    id: uuidv4(),
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    calories: 400,
    carbs: 40,
    protein: 25,
    fats: 15,
    price: 0,
    available: true,
  });

  const newCategoryDefaults = (): Category => ({
    id: "",
    nameAr: "",
    nameEn: "",
    icon: "🍽️",
    order: (data?.categories.length ?? 0) + 1,
    items: [],
  });

  const handleSaveCategory = async () => {
    if (!editingCategory || !data) return;
    if (!editingCategory.nameAr.trim() || !editingCategory.nameEn.trim()) {
      showMsg("يرجى إدخال اسم القسم بالعربي والإنجليزي");
      return;
    }

    const exists = data.categories.find((c) => c.id === editingCategory.id);
    const isNew = !exists;

    let category = { ...editingCategory };
    if (isNew) {
      const ids = data.categories.map((c) => c.id);
      category = {
        ...category,
        id: makeCategoryId(category.nameEn, ids),
        items: [],
      };
    }

    await apiCall({
      action: isNew ? "addCategory" : "updateCategory",
      category,
    });

    setSelectedCategory(category.id);
    setEditingCategory(null);
    showMsg(isNew ? "تم إضافة القسم" : "تم تحديث القسم");
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (cat.items.length > 0) {
      showMsg("احذف أو انقل الأطباق قبل حذف القسم");
      return;
    }
    if (!confirm(`حذف قسم "${cat.nameAr}"؟`)) return;
    await apiCall({ action: "deleteCategory", categoryId: cat.id });
    if (selectedCategory === cat.id) {
      const next = data?.categories.find((c) => c.id !== cat.id);
      if (next) setSelectedCategory(next.id);
    }
    showMsg("تم حذف القسم");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-deep to-teal-forest flex items-center justify-center p-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin}
          className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image src="/logo-ar.png" alt="" fill className="object-contain" />
            </div>
            <h1 className="font-heading font-bold text-xl text-teal-forest">لوحة التحكم</h1>
            <p className="text-teal-forest/50 text-sm font-arabic mt-1">روح الحياة</p>
          </div>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full px-4 py-3 pl-12 rounded-xl bg-cream border border-teal-forest/10 font-arabic focus:outline-none focus:border-olive-fresh"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-forest/30"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-olive-fresh to-olive-dark text-white font-arabic font-bold disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
          <a href="/" className="block text-center mt-4 text-teal-forest/40 text-sm font-arabic hover:text-teal-forest">
            ← العودة للقائمة
          </a>
          {message && (
            <p className="text-center mt-4 text-sm font-arabic text-amber-gold">{message}</p>
          )}
        </motion.form>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-2 border-olive-fresh border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 bg-teal-deep text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-lg">لوحة التحكم</h1>
            <p className="text-white/50 text-xs font-arabic">روح الحياة • Spirito Vita</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors" title="عرض القائمة">
              <Home size={18} />
            </a>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin-auth");
                setIsLoggedIn(false);
              }}
              className="p-2.5 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 -mt-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "أطباق", val: stats.items, icon: Utensils },
            { label: "أقسام", val: stats.categories, icon: LayoutGrid },
            { label: "أوفلاين", val: stats.hidden, icon: EyeOff },
            { label: "متوسط السعرات", val: stats.avgCal, icon: Flame },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-teal-forest/5 text-center">
              <s.icon size={14} className="text-olive-fresh mx-auto mb-1" />
              <p className="font-numeric text-teal-forest text-sm crisp-text">{s.val}</p>
              <p className="text-[9px] text-teal-forest/40 font-arabic">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-teal-forest/5">
          {[
            { id: "items" as const, label: "الأطباق", icon: Utensils },
            { id: "categories" as const, label: "الأقسام", icon: LayoutGrid },
            { id: "overview" as const, label: "نظرة عامة", icon: BarChart3 },
            { id: "settings" as const, label: "الإعدادات", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-arabic font-semibold transition-all ${
                activeTab === tab.id ? "bg-teal-forest text-white shadow-sm" : "text-teal-forest/50"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="max-w-4xl mx-auto px-4 mb-2">
          <div className="bg-olive-fresh/15 text-olive-dark px-4 py-2.5 rounded-xl text-sm font-arabic text-center border border-olive-fresh/20">
            {message}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {activeTab === "items" && (
          <>
            <div className="flex gap-2 overflow-x-auto mb-3 pb-1 scrollbar-hide">
              {data.categories
                .sort((a, b) => a.order - b.order)
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-arabic font-semibold transition-all ${
                      selectedCategory === cat.id
                        ? "bg-olive-fresh text-white shadow-sm"
                        : "bg-white text-teal-forest/60 border border-teal-forest/10"
                    }`}
                  >
                    {cat.icon} {cat.nameAr}
                  </button>
                ))}
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-forest/30" />
              <input
                type="text"
                placeholder="ابحث في الأطباق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-white border border-teal-forest/10 font-arabic text-sm focus:outline-none focus:border-olive-fresh"
              />
            </div>

            <button
              onClick={() => setEditingItem(newItemDefaults())}
              className="w-full mb-3 py-3 rounded-2xl border-2 border-dashed border-olive-fresh/40 text-olive-dark font-arabic font-semibold flex items-center justify-center gap-2 hover:bg-olive-fresh/5 transition-colors"
            >
              <Plus size={18} />
              إضافة طبق جديد
            </button>

            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm border border-teal-forest/5"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={getItemImage(item.id, selectedCategory, item.image)}
                      alt={item.nameAr}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-teal-forest text-sm">{item.nameAr}</h3>
                      {!item.available && (
                        <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-arabic">
                          أوفلاين
                        </span>
                      )}
                      {item.available && (
                        <span className="text-[9px] bg-olive-fresh/15 text-olive-dark px-1.5 py-0.5 rounded-full font-arabic">
                          أونلاين
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-teal-forest/40">{item.nameEn}</p>
                    {item.descriptionAr && (
                      <p className="text-[10px] text-teal-forest/55 font-arabic mt-1 line-clamp-2 leading-relaxed">
                        {item.descriptionAr}
                      </p>
                    )}
                    <div className="mt-1.5">
                      <NutritionBadge
                        calories={item.calories}
                        carbs={item.carbs}
                        protein={item.protein}
                        fats={item.fats}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-amber-gold font-numeric text-xs crisp-text">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleToggleAvailable(item)}
                      title={item.available ? "إخفاء من المنيو" : "إظهار في المنيو"}
                      className={`p-2 rounded-lg ${item.available ? "bg-olive-fresh/10 text-olive-fresh" : "bg-red-50 text-red-400"}`}
                    >
                      {item.available ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => setEditingItem({ ...item })}
                      className="p-2 rounded-lg bg-teal-forest/5 text-teal-forest"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="p-2 rounded-lg bg-red-50 text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-center text-teal-forest/40 font-arabic py-8">لا توجد نتائج</p>
              )}
            </div>
          </>
        )}

        {activeTab === "categories" && (
          <>
            <button
              onClick={() => setEditingCategory(newCategoryDefaults())}
              className="w-full mb-4 py-3 rounded-2xl border-2 border-dashed border-teal-forest/30 text-teal-forest font-arabic font-semibold flex items-center justify-center gap-2 hover:bg-teal-forest/5 transition-colors"
            >
              <Plus size={18} />
              إضافة قسم جديد
            </button>

            <div className="space-y-2">
              {data.categories
                .sort((a, b) => a.order - b.order)
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-teal-forest/5"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-teal-forest">{cat.nameAr}</h3>
                      <p className="text-[10px] text-teal-forest/40 font-latin">{cat.nameEn}</p>
                      <p className="text-[10px] text-teal-forest/50 font-arabic mt-1">
                        {cat.items.length} طبق • ترتيب {cat.order}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditingCategory({ ...cat })}
                        className="p-2 rounded-lg bg-teal-forest/5 text-teal-forest"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-lg bg-red-50 text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {activeTab === "overview" && (
          <div className="space-y-3">
            {data.categories
              .sort((a, b) => a.order - b.order)
              .map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl p-4 border border-teal-forest/5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-bold text-teal-forest">
                      {cat.icon} {cat.nameAr}
                    </h3>
                    <span className="text-xs text-teal-forest/40 font-arabic">
                      {cat.items.length} طبق
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.items.map((item) => (
                      <span
                        key={item.id}
                        className={`text-[10px] px-2 py-1 rounded-full font-arabic ${
                          item.available
                            ? "bg-olive-fresh/10 text-olive-dark"
                            : "bg-gray-100 text-gray-400 line-through"
                        }`}
                      >
                        {item.nameAr}
                        {!item.available && " (أوفلاين)"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-forest/5 space-y-4">
            <h2 className="font-heading font-bold text-teal-forest text-lg">معلومات المطعم</h2>
            {(
              [
                ["nameAr", "الاسم بالعربي"],
                ["nameEn", "الاسم بالإنجليزي"],
                ["phone", "رقم الهاتف"],
                ["whatsapp", "واتساب (مع رمز الدولة)"],
                ["address", "العنوان"],
                ["hours", "أوقات العمل"],
                ["mapUrl", "رابط الخريطة"],
                ["taglineAr", "الشعار"],
                ["descriptionAr", "الوصف"],
                ["instagram", "انستغرام"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-arabic text-teal-forest/60 mb-1">{label}</label>
                <input
                  type="text"
                  value={data.restaurant[key] || ""}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, [key]: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 font-arabic text-sm focus:outline-none focus:border-olive-fresh"
                  dir={key.includes("En") ? "ltr" : "rtl"}
                />
              </div>
            ))}
            <AudioUploader
              currentUrl={data.restaurant.backgroundMusic}
              adminPassword={adminPassword}
              onMusicChange={(url) =>
                setData({
                  ...data,
                  restaurant: { ...data.restaurant, backgroundMusic: url },
                })
              }
            />
            <button
              onClick={handleSaveRestaurant}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-forest to-teal-deep text-white font-arabic font-bold flex items-center justify-center gap-2"
            >
              <Save size={18} />
              حفظ الإعدادات
            </button>
          </div>
        )}
      </div>

      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-5 w-full max-w-md"
          >
            <h2 className="font-heading font-bold text-lg text-teal-forest mb-4">
              {data.categories.find((c) => c.id === editingCategory.id)
                ? "تعديل القسم"
                : "إضافة قسم جديد"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-arabic text-teal-forest/60">الاسم بالعربي *</label>
                <input
                  value={editingCategory.nameAr}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, nameAr: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 font-arabic focus:outline-none focus:border-olive-fresh"
                />
              </div>
              <div>
                <label className="text-sm font-arabic text-teal-forest/60">الاسم بالإنجليزي *</label>
                <input
                  value={editingCategory.nameEn}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, nameEn: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 font-latin focus:outline-none focus:border-olive-fresh"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-arabic text-teal-forest/60">الأيقونة</label>
                  <input
                    value={editingCategory.icon}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, icon: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 text-center text-xl focus:outline-none focus:border-olive-fresh"
                  />
                </div>
                <div>
                  <label className="text-sm font-arabic text-teal-forest/60">الترتيب</label>
                  <input
                    type="number"
                    value={editingCategory.order}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 font-numeric focus:outline-none focus:border-olive-fresh"
                    dir="ltr"
                    min={1}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-3 rounded-xl bg-teal-forest/5 text-teal-forest font-arabic font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-forest to-teal-deep text-white font-arabic font-bold"
              >
                حفظ القسم
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-heading font-bold text-lg text-teal-forest mb-4">
              {data.categories.flatMap((c) => c.items).find((i) => i.id === editingItem.id)
                ? "تعديل الطبق"
                : "إضافة طبق جديد"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-arabic text-teal-forest/60">الاسم بالعربي *</label>
                <input
                  value={editingItem.nameAr}
                  onChange={(e) => setEditingItem({ ...editingItem, nameAr: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 font-arabic focus:outline-none focus:border-olive-fresh"
                />
              </div>
              <div>
                <label className="text-sm font-arabic text-teal-forest/60">الاسم بالإنجليزي *</label>
                <input
                  value={editingItem.nameEn}
                  onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 focus:outline-none focus:border-olive-fresh"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-arabic text-teal-forest/60">الوصف بالعربي *</label>
                <textarea
                  value={editingItem.descriptionAr || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value })}
                  rows={3}
                  placeholder="وصف الطبق والمكونات..."
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 font-arabic focus:outline-none focus:border-olive-fresh resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-arabic text-teal-forest/60">السعرات الحرارية *</label>
                  <input
                    type="number"
                    value={editingItem.calories ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        calories: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 focus:outline-none focus:border-olive-fresh font-numeric"
                    dir="ltr"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm font-arabic text-teal-forest/60">الكربوهيدرات (غ) *</label>
                  <input
                    type="number"
                    value={editingItem.carbs ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        carbs: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 focus:outline-none focus:border-olive-fresh font-numeric"
                    dir="ltr"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm font-arabic text-teal-forest/60">البروتين (غ) *</label>
                  <input
                    type="number"
                    value={editingItem.protein ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        protein: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 focus:outline-none focus:border-olive-fresh font-numeric"
                    dir="ltr"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm font-arabic text-teal-forest/60">الدهون (غ) *</label>
                  <input
                    type="number"
                    value={editingItem.fats ?? ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        fats: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 focus:outline-none focus:border-olive-fresh"
                    dir="ltr"
                    min={0}
                  />
                </div>
                <div>
                  <label className="text-sm font-arabic text-teal-forest/60">السعر (د.ع) *</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-cream border border-teal-forest/10 focus:outline-none focus:border-olive-fresh font-numeric"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-cream border border-teal-forest/10">
                <div>
                  <p className="text-sm font-arabic font-semibold text-teal-forest">عرض في المنيو</p>
                  <p className="text-[11px] text-teal-forest/50 font-arabic mt-0.5">
                    {editingItem.available
                      ? "الطبق ظاهر للزبائن (أونلاين)"
                      : "الطبق مخفي عن الزبائن (أوفلاين)"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingItem({ ...editingItem, available: !editingItem.available })
                  }
                  className={`px-4 py-2 rounded-xl font-arabic text-sm font-bold transition-colors ${
                    editingItem.available
                      ? "bg-olive-fresh text-white"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {editingItem.available ? "أونلاين" : "أوفلاين"}
                </button>
              </div>

              <ImageUploader
                itemId={editingItem.id}
                categoryId={selectedCategory}
                currentImage={editingItem.image}
                adminPassword={adminPassword}
                onImageChange={(url) =>
                  setEditingItem({
                    ...editingItem,
                    image: url,
                  })
                }
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 rounded-xl bg-teal-forest/5 text-teal-forest font-arabic font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-olive-fresh to-olive-dark text-white font-arabic font-bold"
              >
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
