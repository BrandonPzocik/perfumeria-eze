import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Perfume, PerfumeVariant } from "../types";
import { cartLineKey } from "../lib/product";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  checkoutStep: "cart" | "details";
  customerName: string;
  customerAddress: string;
  open: () => void;
  openForCheckout: () => void;
  close: () => void;
  addItem: (product: Perfume, opts?: { qty?: number; variant?: PerfumeVariant }) => void;
  setQty: (id: string, qty: number, variantId?: string) => void;
  removeItem: (id: string, variantId?: string) => void;
  clear: () => void;
  setCheckoutStep: (step: "cart" | "details") => void;
  setCustomerInfo: (name: string, address: string) => void;
}

function sameLine(line: CartLine, id: string, variantId?: string) {
  return cartLineKey(line.id, line.variantId) === cartLineKey(id, variantId);
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
      openForCheckout: () => set({ isOpen: true, checkoutStep: "details" }),
      close: () => set({ isOpen: false, checkoutStep: "cart" }),
      addItem: (product, opts) =>
        set((state) => {
          const qty = opts?.qty ?? 1;
          const variant = opts?.variant;
          const variantId = variant?.id;
          const size = variant?.size;
          const existing = state.lines.find((l) => sameLine(l, product.id, variantId));
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, product.id, variantId) ? { ...l, qty: l.qty + qty, size: size || l.size } : l
              ),
            };
          }
          return { lines: [...state.lines, { id: product.id, qty, variantId, size }] };
        }),
      setQty: (id, qty, variantId) =>
        set((state) => {
          if (qty <= 0) return { lines: state.lines.filter((l) => !sameLine(l, id, variantId)) };
          return { lines: state.lines.map((l) => (sameLine(l, id, variantId) ? { ...l, qty } : l)) };
        }),
      removeItem: (id, variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => !sameLine(l, id, variantId)) })),
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
