import { create } from "zustand";
import { api } from "../lib/api";
import type { StoreSettings } from "../types";

const FALLBACK: StoreSettings = {
  whatsappNumber: "5491100000000",
  whatsappNumberFemenino: "",
  whatsappNumberMasculino: "",
  whatsappMessage: "Hola! Quiero realizar el siguiente pedido:",
  storeName: "Perfumería",
  storeNameAccent: "Árabe",
  logoUrl: null,
  bannerUrl: null,
  primaryColor: "#3D3229",
  accentColor: "#A68B5B",
  instagramUrl: null,
  instagramUrlFemenino: "",
  facebookUrl: null,
  schedule: "Lun a Sáb · 10 a 20h",
  currency: "ARS",
  showCurrency: true,
  darkModeDefault: false,
};

interface SettingsState {
  settings: StoreSettings;
  loaded: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: FALLBACK,
  loaded: false,
  fetchSettings: async () => {
    if (get().loaded) return;
    try {
      const settings = await api.get<StoreSettings>("/settings");
      set({ settings, loaded: true });
    } catch {
      set({ loaded: true }); // seguimos con el fallback si la API no responde
    }
  },
}));
