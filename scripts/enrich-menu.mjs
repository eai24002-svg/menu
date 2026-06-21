import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const menuPath = path.join(__dirname, "../data/menu.json");

const ITEM_META = {
  b1: { descriptionAr: "برغر كلاسيكي بقطعة لحم مشوية، خس طازج، طماطم وصلصة خاصة على خبز برغر محمص", calories: 520 },
  b2: { descriptionAr: "برغر مع جبنة شيدر ذائبة، لحم مشوي وخضار طازجة بصلصة روح الحياة", calories: 580 },
  b3: { descriptionAr: "برغر مع فطر مشوي طري وصلصة كريمية خفيفة مع جبنة وجبن بارميزان", calories: 560 },
  b4: { descriptionAr: "برغر حار بنكهة مميزة مع صلصة داينمت وخضار مقرمشة", calories: 540 },
  b5: { descriptionAr: "دبل برغر بقطعتين لحم مشويتين مع جبنة وصلصات خاصة", calories: 720 },
  b6: { descriptionAr: "برغر التوقيع في روح الحياة بمكونات صحية مختارة ولحم مشوي عالي الجودة", calories: 620 },
  b7: { descriptionAr: "برغر محشو بالجبنة والمكونات الخاصة مع نكهة غنية ومتوازنة", calories: 680 },
  b8: { descriptionAr: "برغر بنكهة لبنانية مع بهارات شرقية وخضار طازجة", calories: 550 },
  b9: { descriptionAr: "ستيك دجاج مشوي متبل بخلطة بهارات خاصة مع خضار جانبية", calories: 420 },
  b10: { descriptionAr: "دبل ستيك دجاج مشوي بقطعتين من صدر الدجاج المتبل", calories: 560 },
  s1: { descriptionAr: "شوربة نيوكي كريمية مع خضار طازجة ونكهة إيطالية خفيفة", calories: 280 },
  s2: { descriptionAr: "شوربة دجاج منزلية غنية بالخضار والنكهات الدافئة", calories: 220 },
  s3: { descriptionAr: "شوربة عدس مغذية محضرة بطريقة صحية غنية بالبروتين النباتي", calories: 190 },
  s4: { descriptionAr: "شوربة خضار موسمية خفيفة ومغذية بقيمة غذائية عالية", calories: 160 },
  s5: { descriptionAr: "شوربة فطر كريمية بنكهة غنية وقوام ناعم", calories: 210 },
  sd1: { descriptionAr: "بطاطا مشوية مقرمشة مع صلصة خاصة من روح الحياة", calories: 280 },
  sd2: { descriptionAr: "كومبير مكس ببطاطا محشوة بخلطة متنوعة من الإضافات الصحية", calories: 520 },
  sd3: { descriptionAr: "بطاطا مع لحم مفروم متبل ومشوي بصلصة خاصة", calories: 580 },
  sd4: { descriptionAr: "كومبير دجاج مع صدر دجاج مشوي وإضافات طازجة", calories: 540 },
  p1: { descriptionAr: "باستا بيني مع صلصة طماطم حارة وجبنة بارميزان", calories: 520 },
  p2: { descriptionAr: "فوتوشيني مع روبيان وصلصة كريمية وجبنة بارميزان", calories: 620 },
  p3: { descriptionAr: "فوتوشيني مع دجاج وصلصة كريمية وجبنة بارميزان", calories: 580 },
  p4: { descriptionAr: "سباغيتي مع لحم مفروم وصلصة بولونيز كلاسيكية", calories: 560 },
  p5: { descriptionAr: "سباغيتي مع صلصة ريحان ودجاج مشوي وجبنة بارميزان", calories: 540 },
  sl1: { descriptionAr: "سلطة معكرونة مع قطع دجاج طرية وخضار موسمية", calories: 380 },
  sl2: { descriptionAr: "تبولة لبنانية تقليدية بالبقدونس والطماطم والبرغل", calories: 220 },
  sl3: { descriptionAr: "سلطة يونانية بخيار وطماطم وزيتون وجبنة فيتا", calories: 320 },
  sl4: { descriptionAr: "مزيج خضار إيطالية طازجة مع صلصة خاصة خفيفة", calories: 280 },
  sl5: { descriptionAr: "سلطة موسمية مع فراولة وأناناس وذرة بنكهة منعشة", calories: 290 },
  sl6: { descriptionAr: "سلطة شمندر مغربية منعشة مع برتقال وخلطة خاصة", calories: 240 },
  sl7: { descriptionAr: "فتوش بخضار طازجة وخبز محمص وصلصة سماق", calories: 260 },
  sl8: { descriptionAr: "سلطة سيزر بخس طازج ودجاج مشوي وجبنة بارميزان", calories: 420 },
  m1: { descriptionAr: "ستيك سلمون مشوي غني بأوميغا 3 مع خضار وصلصة خفيفة", calories: 480 },
  m2: { descriptionAr: "شوربة فو فيليه لحم بنكهة آسيوية مع خضار ونودلز", calories: 520 },
  m3: { descriptionAr: "دجاج توسكان بصلصة كريمية بالطماطم المجففة والأعشاب", calories: 460 },
  m4: { descriptionAr: "دجاج بيكاتا بصلصة ليمون وزبدة مع أعشاب إيطالية", calories: 440 },
  m5: { descriptionAr: "دجاج سوبريم بصلصة غنية مع خضار مشوية", calories: 480 },
  m6: { descriptionAr: "كوردون بلو محشو بالجبن واللحم مع صلصة خاصة", calories: 620 },
  m7: { descriptionAr: "فخارة دجاج بالجبن مخبوزة ببطء مع خضار وصلصة كريمية", calories: 540 },
  m8: { descriptionAr: "دجاج مشوي بالفرن متبل بخلطة أعشاب مع بطاطا وخضار", calories: 680 },
  m9: { descriptionAr: "طاووق مشوي متبل مع أرز أصفر وثومية وخضار مشوية", calories: 520 },
  m10: { descriptionAr: "فخارة دجاج مع صلصة بندورة طازجة وأعشاب", calories: 500 },
  m11: { descriptionAr: "ستيك دجاج بصلصة فطر كريمية مع خضار جانبية", calories: 480 },
  m12: { descriptionAr: "دجاج مكسيكي متبل بفلفل حلو وبصل وصلصة خاصة", calories: 460 },
  m13: { descriptionAr: "دجاج بيستو بصلصة ريحان طازجة مع خضار مشوية", calories: 450 },
  m14: { descriptionAr: "ستروغونوف لحم بصلصة كريمية وفطر مع أرز أو بطاطا", calories: 580 },
  m15: { descriptionAr: "ستروغونوف دجاج بصلصة كريمية خفيفة مع فطر", calories: 520 },
  m16: { descriptionAr: "برياني لحم بالأراضي الباسماتي والبهارات الهندية", calories: 620 },
  m17: { descriptionAr: "برياني دجاج مع أرز معطر وبهارات تقليدية", calories: 540 },
  m18: { descriptionAr: "مشاوي مشكلة من لحم ودجاج مع خضار مشوية وثومية", calories: 650 },
  m19: { descriptionAr: "داود باشا بكرات لحم بصلصة طماطم وبهارات شرقية", calories: 520 },
  m20: { descriptionAr: "كاري دجاج بصلصة كاري كريمية مع أرز أبيض", calories: 480 },
  m21: { descriptionAr: "كاري روبيان بصلصة كاري غنية مع خضار وتوابل هندية", calories: 420 },
  m22: { descriptionAr: "دجاج سويت اند ساور بصلصة حلوة وحامضة مع خضار", calories: 460 },
  m23: { descriptionAr: "وجبة كفته مشوية مع أرز وخضار وصلصة طماطم", calories: 580 },
  sw1: { descriptionAr: "سندويتش دجاج باربيكيو مع جبنة شيدر وخضار طازجة", calories: 480 },
  sw2: { descriptionAr: "سندويتش طاووق مع جبنة ذائبة وثومية", calories: 520 },
  sw3: { descriptionAr: "سندويتش فاهيتا بدجاج متبل وفلفل حلو وبصل", calories: 440 },
  sw4: { descriptionAr: "سندويتش فلاديفيا بشرائح لحم وجبنة وخضار", calories: 560 },
  sw5: { descriptionAr: "سندويتش فرانسيسكو بدجاج وصلصة خاصة وجبنة", calories: 500 },
  sw6: { descriptionAr: "كلوب ساندويتش روح الحياة بطبقات دجاج وخضار وبيض", calories: 540 },
  sw7: { descriptionAr: "فيلي شيز ستيك بشرائح لحم وجبنة مشوية", calories: 620 },
  sw8: { descriptionAr: "ساب دجاج بخضار طازجة وصلصات متنوعة", calories: 480 },
  sw9: { descriptionAr: "وجبة شاورما دجاج مع بطاطا وثومية وخبز طازج", calories: 520 },
  sw10: { descriptionAr: "دونر تركي بشرائح لحم متبلة مع خضار وصلصة", calories: 500 },
  sw11: { descriptionAr: "سندويتش فيليه سمك مقلي بخضار وصلصة تارتار", calories: 420 },
  sw12: { descriptionAr: "سندويتش سجق مشوي مع خضار وصلصة خاصة", calories: 480 },
  sw13: { descriptionAr: "سندويتش كفته مشوية مع خضار وثومية", calories: 460 },
  sw14: { descriptionAr: "سندويتش روبيان متبل مع خس وصلصة خاصة", calories: 380 },
  sw15: { descriptionAr: "ساب مارين دجاج بكمية سخية من الدجاج والخضار", calories: 520 },
  pz1: { descriptionAr: "بيتزا دجاج مشوي مع جبنة موزاريلا وصلصة طماطم", calories: 580 },
  pz2: { descriptionAr: "بيتزا لحم بقطع لحم متبلة وجبنة ذائبة", calories: 640 },
  pz3: { descriptionAr: "بيتزا أرمنية باللحم المفروم والبهارات الخاصة", calories: 620 },
  pz4: { descriptionAr: "بيتزا ألفريدو بصلصة كريمية ودجاج وجبنة", calories: 600 },
  pz5: { descriptionAr: "بيتزا خضار طازجة بجبنة موزاريلا وصلصة طماطم", calories: 480 },
  pz6: { descriptionAr: "بيتزا روبيان مع ثوم وصلصة خاصة وجبنة موزاريلا", calories: 520 },
  pz7: { descriptionAr: "بيتزا دجاج مع خضار مشكلة وجبنة موزاريلا", calories: 560 },
  pz8: { descriptionAr: "لحم بعجين تقليدي باللحم المفروم والبهارات", calories: 540 },
  pz9: { descriptionAr: "مارغريتا كلاسيكية بجبنة موزاريلا وريحان طازج", calories: 460 },
  h1: { descriptionAr: "شرائح لحم مشوية مع خضار طازجة وأرز أو برغل", calories: 480 },
  h2: { descriptionAr: "صدر دجاج مشوي مع خضار طازجة وأرز أو برغل", calories: 380 },
  h3: { descriptionAr: "فيليه سمك أبيض مشوي مع خضار وأرز أو برغل", calories: 340 },
  h4: { descriptionAr: "ريزو سبيريتو بصدر دجاج وأرز وصلصات حسب الطلب", calories: 420 },
  d1: { descriptionAr: "تشيز كيك كريمي بنكهة الفانيلا مع طبقة بسكويت", calories: 380 },
  d2: { descriptionAr: "تيراميسو إيطالي بطبقات قهوة وماسكاربوني وكاكاو", calories: 350 },
  d3: { descriptionAr: "ترافيل شوكولا وشوفان بطبقات كريمية ومقرمشة", calories: 320 },
  d4: { descriptionAr: "رز بالحليب كريمي بنكهة مستكة وفانيلا", calories: 280 },
  d5: { descriptionAr: "محلبي تقليدي بنكهة ماء الزهر وفستق", calories: 220 },
};

const CATEGORY_MACROS = {
  burgers: { protein: 0.28, carbs: 0.32, fats: 0.4 },
  soup: { protein: 0.22, carbs: 0.45, fats: 0.33 },
  sides: { protein: 0.15, carbs: 0.5, fats: 0.35 },
  pasta: { protein: 0.22, carbs: 0.48, fats: 0.3 },
  salads: { protein: 0.25, carbs: 0.4, fats: 0.35 },
  main: { protein: 0.35, carbs: 0.3, fats: 0.35 },
  sandwiches: { protein: 0.3, carbs: 0.38, fats: 0.32 },
  pizza: { protein: 0.25, carbs: 0.42, fats: 0.33 },
  healthy: { protein: 0.4, carbs: 0.35, fats: 0.25 },
  desserts: { protein: 0.1, carbs: 0.55, fats: 0.35 },
};

function estimateMacros(calories, categoryId) {
  const ratio = CATEGORY_MACROS[categoryId] || { protein: 0.25, carbs: 0.4, fats: 0.35 };
  return {
    protein: Math.round((calories * ratio.protein) / 4),
    carbs: Math.round((calories * ratio.carbs) / 4),
    fats: Math.round((calories * ratio.fats) / 9),
  };
}

const menu = JSON.parse(fs.readFileSync(menuPath, "utf-8"));

for (const cat of menu.categories) {
  for (const item of cat.items) {
    const meta = ITEM_META[item.id];
    if (meta) {
      if (!item.descriptionAr) item.descriptionAr = meta.descriptionAr;
      item.calories = meta.calories;
    } else {
      item.descriptionAr = item.descriptionAr || `${item.nameAr} — طبق مميز من قسم ${cat.nameAr} محضر بطريقة صحية في روح الحياة`;
      item.calories = item.calories ?? 400;
    }
    const macros = estimateMacros(item.calories, cat.id);
    item.carbs = macros.carbs;
    item.protein = macros.protein;
    item.fats = macros.fats;
    item.descriptionEn = item.descriptionEn || `${item.nameEn} — A healthy ${cat.nameEn} dish from Spirito Vita`;
    if (item.available === undefined) item.available = true;
  }
}

fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2), "utf-8");
console.log("Enriched", menu.categories.reduce((n, c) => n + c.items.length, 0), "items");
