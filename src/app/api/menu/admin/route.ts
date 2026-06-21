import { NextRequest, NextResponse } from "next/server";
import { getMenuData, saveMenuData, verifyAdminPassword } from "@/lib/menu-store";
import type { MenuData } from "@/lib/types";

function checkAuth(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password");
  return password ? verifyAdminPassword(password) : false;
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data: MenuData = await request.json();
  await saveMenuData(data);
  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { action, categoryId, item, category } = body;
  const data = await getMenuData();

  switch (action) {
    case "addItem": {
      const cat = data.categories.find((c) => c.id === categoryId);
      if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });
      cat.items.push(item);
      break;
    }
    case "updateItem": {
      for (const cat of data.categories) {
        const idx = cat.items.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
          cat.items[idx] = item;
          break;
        }
      }
      break;
    }
    case "deleteItem": {
      for (const cat of data.categories) {
        cat.items = cat.items.filter((i) => i.id !== item.id);
      }
      break;
    }
    case "addCategory": {
      data.categories.push(category);
      data.categories.sort((a, b) => a.order - b.order);
      break;
    }
    case "updateCategory": {
      const idx = data.categories.findIndex((c) => c.id === category.id);
      if (idx !== -1) data.categories[idx] = { ...data.categories[idx], ...category };
      break;
    }
    case "deleteCategory": {
      data.categories = data.categories.filter((c) => c.id !== categoryId);
      break;
    }
    case "updateRestaurant": {
      data.restaurant = { ...data.restaurant, ...body.restaurant };
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await saveMenuData(data);
  return NextResponse.json({ success: true, data });
}
