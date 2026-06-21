import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const menuPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data/menu.json");
const menu = JSON.parse(fs.readFileSync(menuPath, "utf-8"));

const categoryOrder = {
  pasta: 1,
  burgers: 2,
  soup: 3,
  sides: 4,
  salads: 5,
  main: 6,
  sandwiches: 7,
  pizza: 8,
  healthy: 9,
  desserts: 10,
};

const pastaUpdates = {
  p1: {
    nameAr: "بيني أريابياتا",
    descriptionAr: "معكرونة بيني مع صوص الطماطم الحار مع جبنة البارميزان",
  },
  p2: {
    descriptionAr: "باستا الفوتوشيني مع الروبيان والصوص الكريمي وجبنة البارميزان",
  },
  p3: {
    descriptionAr: "باستا الفوتوشيني مع الدجاج والصوص الكريمي وجبنة البارميزان",
  },
  p4: {
    descriptionAr: "سباغيتي البولونيز مع لحم مفروم وجبنة البارميزان",
  },
  p5: {
    descriptionAr: "سباغيتي مع صوص الريحان والدجاج المشوي وجبنة البارميزان",
  },
};

for (const cat of menu.categories) {
  if (categoryOrder[cat.id]) {
    cat.order = categoryOrder[cat.id];
  }
  for (const item of cat.items) {
    const patch = pastaUpdates[item.id];
    if (patch) {
      Object.assign(item, patch);
    }
  }
}

menu.categories.sort((a, b) => a.order - b.order);

fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2), "utf-8");
console.log("✓ Menu synced:", menu.categories.length, "categories,", menu.categories.reduce((n, c) => n + c.items.length, 0), "items");
