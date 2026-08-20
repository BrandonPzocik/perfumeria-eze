import { useEffect, useRef, useState } from "react";
import { Save, Upload } from "lucide-react";
import { api, assetUrl } from "../../lib/api";
import { useSettingsStore } from "../../hooks/useSettingsStore";
import type { StoreSettings } from "../../types";

export default function AdminSettings() {
  const { settings, fetchSettings } = useSettingsStore();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => setForm(settings), [settings]);

  const set = (field: keyof StoreSettings, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<{ url: string }>("/upload", formData);
      set("logoUrl", res.url);
    } catch (err: any) {
      alert(err.message || "No se pudo subir el logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api.patch<StoreSettings>("/settings", form, true);
      useSettingsStore.setState({ settings: updated });
      setMessage("Cambios guardados correctamente.");
    } catch (err: any) {
      setMessage(err.message || "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const logo = assetUrl(form.logoUrl);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[800px]">
      <h1 className="font-display text-[28px] mb-1">Configuración</h1>
      <p className="text-[13.5px] text-ink-soft mb-7">Estos cambios se reflejan al instante en el catálogo público.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Marca</h2>
          <div className="flex items-center gap-4 mb-5">
            {logo && <img src={logo} alt="" className="w-16 h-16 rounded-full object-cover border border-line" />}
            <div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2 border border-line rounded-sm px-4 py-2 text-[12.5px] font-semibold hover:border-ink"
              >
                <Upload size={13} /> {uploadingLogo ? "Subiendo…" : "Cambiar logo"}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre de la tienda">
              <input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} className="input" />
            </Field>
            <Field label="Acento / segunda palabra">
              <input value={form.storeNameAccent} onChange={(e) => set("storeNameAccent", e.target.value)} className="input" />
            </Field>
          </div>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">WhatsApp</h2>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Número de WhatsApp (con código de país, sin + ni espacios)">
              <input value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} className="input" placeholder="5491123456789" />
            </Field>
            <Field label="Mensaje inicial del pedido">
              <textarea value={form.whatsappMessage} onChange={(e) => set("whatsappMessage", e.target.value)} rows={2} className="input resize-none" />
            </Field>
          </div>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Redes y horarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Instagram (URL)">
              <input value={form.instagramUrl || ""} onChange={(e) => set("instagramUrl", e.target.value)} className="input" placeholder="https://instagram.com/tu_marca" />
            </Field>
            <Field label="Facebook (URL)">
              <input value={form.facebookUrl || ""} onChange={(e) => set("facebookUrl", e.target.value)} className="input" placeholder="https://facebook.com/tu_marca" />
            </Field>
            <Field label="Horario de atención" className="md:col-span-2">
              <input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} className="input" />
            </Field>
          </div>
        </section>

        <section className="bg-white border border-line rounded-md p-6">
          <h2 className="text-[13px] font-semibold mb-4 text-wine">Moneda y colores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Moneda">
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="input">
                <option value="ARS">Peso argentino (ARS)</option>
                <option value="USD">Dólar (USD)</option>
              </select>
            </Field>
            <Field label="Mostrar moneda">
              <label className="flex items-center gap-2 text-[13px] mt-2">
                <input type="checkbox" checked={form.showCurrency} onChange={(e) => set("showCurrency", e.target.checked)} />
                Visible en precios
              </label>
            </Field>
            <Field label="Color principal">
              <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="input h-[38px] p-1" />
            </Field>
            <Field label="Color de acento">
              <input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="input h-[38px] p-1" />
            </Field>
          </div>
          <p className="text-[11.5px] text-ink-soft/60 mt-3">
            Los colores quedan guardados para uso futuro; el catálogo actual usa la paleta de diseño aprobada.
          </p>
        </section>

        {message && <p className="text-[13px] bg-bottle/10 text-bottle rounded-sm px-4 py-3">{message}</p>}

        <div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-ink text-stone-soft rounded-sm px-6 py-3 text-[13px] font-semibold uppercase tracking-wider hover:bg-wine transition disabled:opacity-50">
            <Save size={15} /> {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      <style>{`.input { border: 1px solid rgba(23,21,26,0.12); border-radius: 2px; padding: 10px 12px; font-size: 13.5px; outline: none; width: 100%; background: white; }
      .input:focus { border-color: #6E1E39; }`}</style>
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
