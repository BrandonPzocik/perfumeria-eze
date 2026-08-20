import { create } from "zustand";

interface ToastState {
  message: string | null;
  show: (message: string) => void;
  clear: () => void;
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => set({ message: null }), 2200);
  },
  clear: () => set({ message: null }),
}));
