import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedState {
  ids: string[];
  register: (id: string) => void;
}

const MAX_ITEMS = 8;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      register: (id) =>
        set((state) => {
          const withoutId = state.ids.filter((x) => x !== id);
          return { ids: [id, ...withoutId].slice(0, MAX_ITEMS) };
        }),
    }),
    { name: "maison-ambar-recent" }
  )
);
