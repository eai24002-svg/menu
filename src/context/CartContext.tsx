"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem, MenuItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; item: MenuItem; categoryId: string }
  | { type: "REMOVE"; itemId: string }
  | { type: "UPDATE_QTY"; itemId: string; quantity: number }
  | { type: "UPDATE_NOTE"; itemId: string; note: string }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

const STORAGE_KEY = "spirito-vita-cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.item.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.item.id === action.item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { item: action.item, categoryId: action.categoryId, quantity: 1 },
        ],
      };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.item.id !== action.itemId) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.item.id !== action.itemId) };
      }
      return {
        items: state.items.map((i) =>
          i.item.id === action.itemId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "UPDATE_NOTE":
      return {
        items: state.items.map((i) =>
          i.item.id === action.itemId ? { ...i, note: action.note } : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: MenuItem, categoryId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: "LOAD", items: JSON.parse(saved) });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + i.item.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem: (item, categoryId) =>
          dispatch({ type: "ADD", item, categoryId }),
        removeItem: (itemId) => dispatch({ type: "REMOVE", itemId }),
        updateQuantity: (itemId, quantity) =>
          dispatch({ type: "UPDATE_QTY", itemId, quantity }),
        updateNote: (itemId, note) =>
          dispatch({ type: "UPDATE_NOTE", itemId, note }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
