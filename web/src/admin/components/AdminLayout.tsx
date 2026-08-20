import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Sparkles, FileSpreadsheet, Settings, LogOut, ExternalLink, Menu } from "lucide-react";
import StoreLogo from "../../components/StoreLogo";
import { useAdminAuthStore } from "../hooks/useAdminAuthStore";
import { useSettingsStore } from "../../hooks/useSettingsStore";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/perfumes", label: "Perfumes", icon: Sparkles },
  { to: "/admin/importar", label: "Importar Excel", icon: FileSpreadsheet },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const admin = useAdminAuthStore((s) => s.admin);
  const logout = useAdminAuthStore((s) => s.logout);
  const settings = useSettingsStore((s) => s.settings);
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <StoreLogo settingsLogo={settings.logoUrl} alt="" className="w-9 h-9 object-contain flex-shrink-0" />
        <div>
          <div className="font-display font-bold uppercase text-[15px] leading-none tracking-wide">
            {settings.storeName}{" "}
            <span className="text-accent-soft">{settings.storeNameAccent}</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-stone-soft/50 mt-1">Panel admin</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive ? "bg-primary text-white" : "text-stone-soft/70 hover:bg-white/10 hover:text-stone-soft"
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] text-stone-soft/70 hover:bg-white/10 hover:text-stone-soft transition-colors"
        >
          <ExternalLink size={15} /> Ver catálogo
        </a>
        <button
          onClick={() => { logout(); navigate("/admin/login"); onNavigate?.(); }}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] text-stone-soft/70 hover:bg-white/10 hover:text-stone-soft transition-colors text-left"
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
        {admin && <div className="text-[11px] text-stone-soft/40 px-3.5 pt-2 truncate">{admin.email}</div>}
      </div>
    </>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-stone text-ink">
      <aside className="hidden lg:flex w-[240px] flex-shrink-0 bg-primary-deep text-stone-soft flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-primary-deep/60 z-40 lg:hidden animate-backdropIn" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-[min(280px,85vw)] bg-primary-deep text-stone-soft z-50 flex flex-col animate-slideInLeft lg:hidden">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-line bg-stone-soft sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} aria-label="Menú" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold uppercase text-[16px] tracking-wide">Panel admin</span>
        </div>

        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
