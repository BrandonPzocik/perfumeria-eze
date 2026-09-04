import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAdminPerfumesStore } from "../hooks/useAdminPerfumesStore";
import { FAMILIES, GENDERS, TYPES } from "../../data/constants";
import ChipInput from "../components/ChipInput";
import ImageManager, { type ManagedImage } from "../components/ImageManager";
import type { Perfume } from "../../types";
import { DECANT_SIZES } from "../../lib/product";

const EMPTY: any = {
  id: "",
  internalCode: "",
  name: "",
  brand: "",
  gender: "Unisex",
  family: "Amaderada",
  type: "EDP",
  size: "100ml",
  description: "",
  price: "",
  oldPrice: "",
  cost: "",
  stock: 0,
  minStock: 3,
  notas: { salida: [], corazon: [], fondo: [] },
  intensidad: 3,
  duracion: "",
  visible: true,
  destacado: false,
  oferta: false,
  nuevo: false,
  masVendido: false,
  variants: DECANT_SIZES.map((size) => ({ size, price: "", stock: "" })),
  images: [] as ManagedImage[],
};

export default function AdminPerfumeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { items, fetchAll, create, update } = useAdminPerfumesStore();
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) fetchAll();
  }, [items.length, fetchAll]);

  useEffect(() => {
    if (isEdit && id) {
      const existing = items.find((p) => p.id === id);
      if (existing) {
        setForm({
          ...existing,
          price: String(existing.price),
          oldPrice: existing.oldPrice ? String(existing.oldPrice) : "",
          cost: existing.cost ? String(existing.cost) : "",
          variants: DECANT_SIZES.map((size) => {
            const found = existing.variants?.find((v) => v.size === size);
            return { id: found?.id, size, price: found ? String(found.price) : "", stock: found ? String(found.stock) : "" };
          }),
          images: existing.images,
        });
      }
    }
  }, [isEdit, id, items]);

  const set = (field: string, value: any) => setForm((f: any) => ({ ...f, [field]: value }));
  const setNota = (key: "salida" | "corazon" | "fondo", values: string[]) =>
    setForm((f: any) => ({ ...f, notas: { ...f.notas, [key]: values } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.id || !form.name || !form.brand) {
      setError("SKU, nombre y marca son obligatorios.");
      return;
    }

    const variants = (form.variants || [])
      .map((v: { id?: string; size: string; price: string; stock: string }) => ({
        id: v.id,
        size: v.size,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
      }))
      .filter((v: { price: number }) => v.price > 0);

    setSaving(true);
    const payload: Partial<Perfume> = {
      ...form,
      kind: "bottle",
      size: form.size,
      price: Number(form.price) || 0,
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      cost: form.cost ? Number(form.cost) : undefined,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 3,
      intensidad: Number(form.intensidad),
      variants,
      images: form.images.map((img: ManagedImage) => ({ url: img.url, isMain: img.isMain })) as any,
    };

    try {
      if (isEdit) {
        await update(form.id, payload);
      } else {
        await create(payload);
      }
      navigate("/admin/perfumes");
    } catch (err: any) {
      setError(err.message || "No se pudo guardar el perfume.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[900px]">
      <button onClick={() => navigate("/admin/perfumes")} className="flex items-center gap-1.5 text-[13px] text-ink-soft mb-5 hover:text-ink">
        <ArrowLeft size={15} /> Volver a perfumes
      </button>

      <h1 className="font-display text-[26px] mb-6">{isEdit ? `Editar ${form.name || ""}` : "Nuevo perfume"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Identificación</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU *">
              <input value={form.id} disabled={isEdit} onChange={(e) => set("id", e.target.value)} required
                className="input" placeholder="SKU-013" />
            </Field>
            <Field label="Código interno">
              <input value={form.internalCode} onChange={(e) => set("internalCode", e.target.value)} className="input" />
            </Field>
            <Field label="Nombre *">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required className="input" />
            </Field>
            <Field label="Marca *">
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} required className="input" />
            </Field>
          </div>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Clasificación</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Género">
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="input">
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Familia olfativa">
              <select value={form.family} onChange={(e) => set("family", e.target.value)} className="input">
                {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Tipo">
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="input">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Tamaño">
              <input
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                className="input"
                placeholder="100ml"
              />
            </Field>
          </div>
          <Field label="Descripción" className="mt-4">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="input resize-none" />
          </Field>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Precio y stock del frasco</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Precio *">
              <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} required className="input" />
            </Field>
            <Field label="Precio oferta">
              <input type="number" min="0" value={form.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} className="input" placeholder="Opcional" />
            </Field>
            <Field label="Costo">
              <input type="number" min="0" value={form.cost} onChange={(e) => set("cost", e.target.value)} className="input" placeholder="Interno" />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} className="input" />
            </Field>
            <Field label="Stock mínimo">
              <input type="number" min="0" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} className="input" />
            </Field>
          </div>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-1 text-wine">Decants</h2>
          <p className="text-[12.5px] text-ink-soft mb-4">
            Opcional. Completá precio solo en los tamaños que vendés. Si lo dejás vacío, ese decant no aparece en la tienda.
          </p>
          <div className="flex flex-col gap-3">
            {(form.variants || []).map((v: { size: string; price: string; stock: string }, index: number) => (
              <div key={v.size} className="grid grid-cols-3 gap-3 items-end">
                <Field label="Tamaño">
                  <input value={v.size} disabled className="input bg-[#F7F4EE]" />
                </Field>
                <Field label="Precio">
                  <input
                    type="number"
                    min="0"
                    value={v.price}
                    onChange={(e) =>
                      set("variants", form.variants.map((row: any, i: number) => (i === index ? { ...row, price: e.target.value } : row)))
                    }
                    className="input"
                    placeholder="Sin decant"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) =>
                      set("variants", form.variants.map((row: any, i: number) => (i === index ? { ...row, stock: e.target.value } : row)))
                    }
                    className="input"
                    placeholder="0"
                  />
                </Field>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Pirámide olfativa</h2>
          <div className="flex flex-col gap-4">
            <ChipInput label="Notas de salida" values={form.notas.salida} onChange={(v) => setNota("salida", v)} />
            <ChipInput label="Notas de corazón" values={form.notas.corazon} onChange={(v) => setNota("corazon", v)} />
            <ChipInput label="Notas de fondo" values={form.notas.fondo} onChange={(v) => setNota("fondo", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label={`Intensidad (${form.intensidad}/5)`}>
              <input type="range" min={1} max={5} value={form.intensidad} onChange={(e) => set("intensidad", e.target.value)} className="w-full" />
            </Field>
            <Field label="Duración">
              <input value={form.duracion} onChange={(e) => set("duracion", e.target.value)} className="input" placeholder="8-10h" />
            </Field>
          </div>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Imágenes</h2>
          <ImageManager images={form.images} onChange={(images) => set("images", images)} />
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Visibilidad y etiquetas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ["visible", "Visible en el catálogo"],
              ["destacado", "Destacado"],
              ["oferta", "En oferta"],
              ["nuevo", "Nuevo ingreso"],
              ["masVendido", "Más vendido"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-[13px] bg-[#F7F4EE] rounded-sm px-3 py-2.5 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
        </section>

        {error && <p className="text-wine text-[13px] bg-wine/10 rounded-sm px-4 py-3">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-ink text-stone-soft rounded-sm px-6 py-3 text-[13px] font-semibold uppercase tracking-wider hover:bg-wine transition disabled:opacity-50">
            <Save size={15} /> {saving ? "Guardando…" : "Guardar perfume"}
          </button>
          <button type="button" onClick={() => navigate("/admin/perfumes")} className="border border-line rounded-sm px-6 py-3 text-[13px] font-semibold">
            Cancelar
          </button>
        </div>
      </form>

      <style>{`.input { border: 1px solid var(--line, rgba(23,21,26,0.12)); border-radius: 2px; padding: 10px 12px; font-size: 13.5px; outline: none; width: 100%; background: white; }
      .input:focus { border-color: #A68B5B; }`}</style>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-[12px] font-semibold text-ink-soft block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
