import { create } from "zustand";
import { api } from "../lib/api";
import type { Perfume } from "../types";

interface PerfumesState {
  items: Perfume[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  fetchAll: () => Promise<void>;
  registerEvent: (id: string, type: "cart" | "whatsapp" | "share") => void;
}

export const usePerfumesStore = create<PerfumesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  loaded: false,
  fetchAll: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const items = await api.get<Perfume[]>("/perfumes");
      set({ items, loading: false, loaded: true });
    } catch (err: any) {
      set({ loading: false, error: err.message || "No se pudo cargar el catálogo." });
    }
  },
  registerEvent: (id, type) => {
    // fire-and-forget, no bloquea la UI
    api.post(`/perfumes/${id}/event`, { type }).catch(() => {});
  },
}));
