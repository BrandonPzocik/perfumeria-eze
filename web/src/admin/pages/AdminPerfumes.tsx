import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Copy, Pencil, Trash2, Eye, EyeOff, Star, Download } from "lucide-react";
import { useAdminPerfumesStore } from "../hooks/useAdminPerfumesStore";
import { formatCurrency } from "../../lib/format";
import { API_BASE, getToken } from "../../lib/api";
import { hasDecants } from "../../lib/product";

export default function AdminPerfumes() {
  const { items, loading, error, fetchAll, remove, duplicate, toggle } = useAdminPerfumesStore();
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((p) => `${p.name} ${p.brand} ${p.id} ${p.family}`.toLowerCase().includes(q));
  }, [items, query]);

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 3000);
      return;
    }
    await remove(id);
    setConfirmDelete(null);
  };

  const exportUrl = `${API_BASE}/import/export`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1300px]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[28px] mb-1">Perfumes</h1>
          <p className="text-[13.5px] text-ink-soft">{items.length} perfumes en el catálogo.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={async () => {
              const token = getToken();
              const res = await fetch(exportUrl, { headers: { Authorization: `Bearer ${token}` } });
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "catalogo-perfumes.xlsx";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 border border-line rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:border-ink transition"
          >
            <Download size={15} /> Exportar Excel
          </button>
          <Link
            to="/admin/perfumes/nuevo"
            className="flex items-center gap-2 bg-ink text-stone-soft rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-wine transition no-underline"
          >
            <Plus size={15} /> Nuevo perfume
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3.5 py-2.5 mb-5 max-w-full sm:max-w-[380px]">
        <Search size={16} className="text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, marca, SKU…"
          className="outline-none text-[13.5px] flex-1 bg-transparent"
        />
      </div>

      {error && <p className="text-wine text-[13px] mb-4">{error}</p>}

      <div className="bg-white border border-line rounded-lg overflow-hidden overflow-x-auto shadow-card">
        <table className="w-full text-[13px] min-w-[900px]">
          <thead>
            <tr className="border-b border-line bg-[#F7F4EE] text-left text-[11px] uppercase tracking-wider text-ink-soft/70">
              <th className="px-4 py-3 font-semibold">Perfume</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-soft">Cargando…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-soft">No hay perfumes que coincidan.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-line-soft hover:bg-[#FAF8F3]">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-ink-soft/60 text-[11.5px]">{p.brand} · {p.family}</div>
                    {hasDecants(p) && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-accent/20 text-[#7A5A1E]">
                        Decants {p.variants!.filter((v) => Number(v.price) > 0).map((v) => v.size).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">{p.id}</td>
                  <td className="px-4 py-3">
                    <div>{formatCurrency(p.price)}</div>
                    {p.variants && p.variants.length > 0 && (
                      <div className="flex flex-col gap-0.5 text-[11px] text-ink-soft mt-1">
                        {p.variants.map((v) => (
                          <span key={v.id}>{v.size} · {formatCurrency(v.price)}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? "text-wine font-semibold" : p.stock <= p.minStock ? "text-[#7A4A16] font-semibold" : ""}>
                      {p.stock}
                    </span>
                    {p.variants && p.variants.length > 0 && (
                      <div className="flex flex-col gap-0.5 text-[11px] text-ink-soft mt-1">
                        {p.variants.map((v) => (
                          <span key={v.id} className={v.stock === 0 ? "text-wine font-semibold" : ""}>{v.size} · {v.stock}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${p.visible ? "bg-bottle/10 text-bottle" : "bg-line text-ink-soft"}`}>
                        {p.visible ? "Visible" : "Oculto"}
                      </span>
                      {p.destacado && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-gold/20 text-[#7A5A1E]">Destacado</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button title="Destacar" onClick={() => toggle(p.id, "destacado", !p.destacado)} className={`p-1.5 rounded hover:bg-line-soft ${p.destacado ? "text-gold" : "text-ink-soft"}`}>
                        <Star size={15} fill={p.destacado ? "#B79358" : "none"} />
                      </button>
                      <button title={p.visible ? "Ocultar" : "Publicar"} onClick={() => toggle(p.id, "visible", !p.visible)} className="p-1.5 rounded hover:bg-line-soft text-ink-soft">
                        {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button title="Duplicar" onClick={() => duplicate(p.id)} className="p-1.5 rounded hover:bg-line-soft text-ink-soft">
                        <Copy size={15} />
                      </button>
                      <Link title="Editar" to={`/admin/perfumes/${p.id}`} className="p-1.5 rounded hover:bg-line-soft text-ink-soft">
                        <Pencil size={15} />
                      </Link>
                      <button
                        title="Eliminar"
                        onClick={() => handleDelete(p.id)}
                        className={`p-1.5 rounded hover:bg-wine/10 ${confirmDelete === p.id ? "text-wine" : "text-ink-soft"}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {confirmDelete === p.id && (
                      <div className="text-[10.5px] text-wine text-right mt-1">Tocá de nuevo para confirmar</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
