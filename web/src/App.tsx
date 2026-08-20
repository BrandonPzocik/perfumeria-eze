import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";

import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/components/AdminLayout";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminPerfumes from "./admin/pages/AdminPerfumes";
import AdminPerfumeForm from "./admin/pages/AdminPerfumeForm";
import AdminImport from "./admin/pages/AdminImport";
import AdminSettings from "./admin/pages/AdminSettings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:id" element={<Home />} />
          <Route path="/favoritos" element={<Favorites />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/perfumes" element={<AdminPerfumes />} />
            <Route path="/admin/perfumes/nuevo" element={<AdminPerfumeForm />} />
            <Route path="/admin/perfumes/:id" element={<AdminPerfumeForm />} />
            <Route path="/admin/importar" element={<AdminImport />} />
            <Route path="/admin/configuracion" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
