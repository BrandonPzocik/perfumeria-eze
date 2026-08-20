import { create } from "zustand";
import { api } from "../../lib/api";
import type { Perfume } from "../../types";

interface AdminPerfumesState {
  items: Perfume[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Partial<Perfume>) => Promise<Perfume>;
  update: (id: string, data: Partial<Perfume>) => Promise<Perfume>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<Perfume>;
  toggle: (id: string, field: "visible" | "destacado" | "oferta" | "nuevo" | "masVendido", value: boolean) => Promise<void>;
}

export const useAdminPerfumesStore = create<AdminPerfumesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const items = await api.get<Perfume[]>("/perfumes/admin/all", true);
      set({ items, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err.message || "No se pudo cargar el catálogo." });
    }
  },

  create: async (data) => {
    const created = await api.post<Perfume>("/perfumes/admin", data, true);
    set({ items: [created, ...get().items] });
    return created;
  },

  update: async (id, data) => {
    const updated = await api.patch<Perfume>(`/perfumes/admin/${id}`, data, true);
    set({ items: get().items.map((p) => (p.id === id ? updated : p)) });
    return updated;
  },

  remove: async (id) => {
    await api.del(`/perfumes/admin/${id}`, true);
    set({ items: get().items.filter((p) => p.id !== id) });
  },

  duplicate: async (id) => {
    const copy = await api.post<Perfume>(`/perfumes/admin/${id}/duplicate`, undefined, true);
    set({ items: [copy, ...get().items] });
    return copy;
  },

  toggle: async (id, field, value) => {
    const updated = await api.patch<Perfume>(`/perfumes/admin/${id}`, { [field]: value }, true);
    set({ items: get().items.map((p) => (p.id === id ? updated : p)) });
  },
}));
