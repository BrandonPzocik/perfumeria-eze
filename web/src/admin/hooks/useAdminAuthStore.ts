import { create } from "zustand";
import { api, getToken, setToken, ApiError } from "../../lib/api";
import type { AdminUser } from "../../types";

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreFromStorage: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  token: getToken(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ token: string; admin: AdminUser }>("/auth/login", { email, password });
      setToken(res.token);
      set({ token: res.token, admin: res.admin, loading: false });
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo iniciar sesión.";
      set({ loading: false, error: message });
      return false;
    }
  },

  logout: () => {
    setToken(null);
    set({ token: null, admin: null });
  },

  restoreFromStorage: () => {
    const token = getToken();
    set({ token });
  },
}));
