import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import StoreLogo from "../../components/StoreLogo";
import { useAdminAuthStore } from "../hooks/useAdminAuthStore";
import { useSettingsStore } from "../../hooks/useSettingsStore";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@maisonambar.com");
  const [password, setPassword] = useState("");
  const login = useAdminAuthStore((s) => s.login);
  const loading = useAdminAuthStore((s) => s.loading);
  const error = useAdminAuthStore((s) => s.error);
  const settings = useSettingsStore((s) => s.settings);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(145deg,var(--color-primary-deep)_0%,#0f2a6b_50%,var(--color-primary)_100%)] px-4 sm:px-6">
      <div className="w-full max-w-[400px] bg-white rounded-2xl p-6 sm:p-8 shadow-2xl shadow-primary-deep/30 animate-fadeInUp">
        <div className="flex flex-col items-center text-center mb-7">
          <StoreLogo
            settingsLogo={settings.logoUrl}
            alt={settings.storeName}
            className="w-20 h-20 object-contain mb-4"
          />
          <span className="font-display font-bold uppercase text-[24px] tracking-wide">
            {settings.storeName}{" "}
            <span className="text-primary">{settings.storeNameAccent}</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mt-1.5">Panel administrador</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-ink-soft uppercase tracking-wide">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-ink-soft uppercase tracking-wide">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          </div>

          {error && <p className="text-[12.5px] text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-1 disabled:opacity-50">
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="text-[11px] text-ink-soft/50 text-center mt-6 leading-relaxed">
          Acceso exclusivo para administradores.
          <br />
          <span className="font-mono text-[10px]">admin@maisonambar.com / admin1234</span>
        </p>
      </div>
    </div>
  );
}
