import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "../hooks/useAdminAuthStore";

export default function ProtectedRoute() {
  const token = useAdminAuthStore((s) => s.token);
  const sessionChecked = useAdminAuthStore((s) => s.sessionChecked);
  const checkSession = useAdminAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone text-[13px] text-ink-soft">
        Verificando sesión…
      </div>
    );
  }

  if (!token) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
