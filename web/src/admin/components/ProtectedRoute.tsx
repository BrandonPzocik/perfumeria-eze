import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "../hooks/useAdminAuthStore";

export default function ProtectedRoute() {
  const token = useAdminAuthStore((s) => s.token);
  if (!token) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
