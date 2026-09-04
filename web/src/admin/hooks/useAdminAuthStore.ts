import { create } from "zustand";
import { api, getToken, setToken, ApiError } from "../../lib/api";
import type { AdminUser } from "../../types";

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  sessionChecked: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  admin: null,
  token: getToken(),
  loading: false,
  error: null,
  sessionChecked: !getToken(),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ token: string; admin: AdminUser }>("/auth/login", { email, password });
      setToken(res.token);
      set({ token: res.token, admin: res.admin, loading: false, sessionChecked: true, error: null });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo iniciar sesión.";
      set({ loading: false, error: message });
      return false;
    }
  },

  logout: () => {
    setToken(null);
    set({ token: null, admin: null, sessionChecked: true, error: null });
  },

  checkSession: async () => {
    if (get().sessionChecked && get().admin) return;
    const token = getToken();
    if (!token) {
      set({ token: null, admin: null, sessionChecked: true });
      return;
    }
    try {
      const res = await api.get<{ ok: boolean; admin: AdminUser }>("/auth/me", true);
      set({ token, admin: res.admin, sessionChecked: true });
    } catch {
      setToken(null);
      set({ token: null, admin: null, sessionChecked: true });
    }
  },
}));
