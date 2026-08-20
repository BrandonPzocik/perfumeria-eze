import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Perfume } from "../types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  checkoutStep: "cart" | "details";
  customerName: string;
  customerAddress: string;
  open: () => void;
  close: () => void;
  addItem: (product: Perfume, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setCheckoutStep: (step: "cart" | "details") => void;
  setCustomerInfo: (name: string, address: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      checkoutStep: "cart",
      customerName: "",
      customerAddress: "",
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false, checkoutStep: "cart" }),
      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === product.id ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return { lines: [...state.lines, { id: product.id, qty }] };
        }),
      setQty: (id, qty) =>
        set((state) => {
          if (qty <= 0) return { lines: state.lines.filter((l) => l.id !== id) };
          return { lines: state.lines.map((l) => (l.id === id ? { ...l, qty } : l)) };
        }),
      removeItem: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [], checkoutStep: "cart" }),
      setCheckoutStep: (step) => set({ checkoutStep: step }),
      setCustomerInfo: (name, address) => set({ customerName: name, customerAddress: address }),
    }),
    {
      name: "maison-ambar-cart",
      partialize: (state) => ({
        lines: state.lines,
        customerName: state.customerName,
        customerAddress: state.customerAddress,
      }),
    }
  )
);
