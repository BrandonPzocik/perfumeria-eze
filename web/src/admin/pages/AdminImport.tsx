import { useState } from "react";
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../../lib/api";

const FIELD_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "No importar" },
  { value: "id", label: "SKU (obligatorio)" },
  { value: "internalCode", label: "Código interno" },
  { value: "name", label: "Nombre (obligatorio)" },
  { value: "brand", label: "Marca (obligatorio)" },
  { value: "gender", label: "Género" },
  { value: "family", label: "Familia olfativa" },
  { value: "type", label: "Tipo" },
  { value: "size", label: "Tamaño" },
  { value: "description", label: "Descripción" },
  { value: "price", label: "Precio" },
  { value: "oldPrice", label: "Precio oferta" },
  { value: "cost", label: "Costo" },
  { value: "stock", label: "Stock" },
  { value: "minStock", label: "Stock mínimo" },
  { value: "intensidad", label: "Intensidad" },
  { value: "duracion", label: "Duración" },
  { value: "notasSalida", label: "Notas de salida" },
  { value: "notasCorazon", label: "Notas de corazón" },
  { value: "notasFondo", label: "Notas de fondo" },
  { value: "imageUrl", label: "Imagen (URL)" },
  { value: "visible", label: "Visible" },
  { value: "destacado", label: "Destacado" },
  { value: "oferta", label: "Oferta" },
  { value: "nuevo", label: "Nuevo" },
  { value: "masVendido", label: "Más vendido" },
  { value: "price2ml", label: "Precio 2ml (decant)" },
  { value: "price5ml", label: "Precio 5ml (decant)" },
  { value: "price10ml", label: "Precio 10ml (decant)" },
  { value: "stock2ml", label: "Stock 2ml (decant)" },
  { value: "stock5ml", label: "Stock 5ml (decant)" },
  { value: "stock10ml", label: "Stock 10ml (decant)" },
];

interface PreviewData {
  fileName: string;
  headers: string[];
  mapping: Record<string, string | null>;
  totalRows: number;
  preview: Record<string, any>[];
  rows: Record<string, any>[];
}

interface CommitResult {
  created: number;
  updated: number;
  errors: string[];
}

export default function AdminImport() {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<PreviewData>("/import/preview", formData);
      setPreview(res);
      const initialMapping: Record<string, string> = {};
      res.headers.forEach((h) => (initialMapping[h] = res.mapping[h] || ""));
      setMapping(initialMapping);
    } catch (err: any) {
      setError(err.message || "No se pudo leer el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<CommitResult>("/import/commit", {
        fileName: preview.fileName,
        mapping,
        rows: preview.rows,
      }, true);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "No se pudo completar la importación.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setMapping({});
    setResult(null);
    setError(null);
  };

  const mappedFields = Object.values(mapping);
  const hasName = mappedFields.includes("name");
  const hasBrand = mappedFields.includes("brand");
  const hasSku = mappedFields.includes("id");
  const hasRequired = hasName && hasBrand && hasSku;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px]">
      <h1 className="font-display text-[28px] mb-1">Importar desde Excel</h1>
      <p className="text-[13.5px] text-ink-soft mb-7">
        Subí un archivo XLSX o CSV, mapeá las columnas y actualizá cientos de perfumes en minutos. Los perfumes se actualizan o crean según coincida el SKU.
        Los precios 2ml / 5ml / 10ml se guardan en la misma ficha del frasco. Si no mapeás esos precios, el perfume queda sin decants.
      </p>

      {!preview && (
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-line rounded-md py-16 cursor-pointer hover:border-ink-soft transition-colors bg-white">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <FileSpreadsheet size={34} className="text-ink-soft" />
          <span className="text-[14px] font-semibold">{loading ? "Leyendo archivo…" : "Hacé clic para elegir tu archivo XLSX o CSV"}</span>
          <span className="text-[12px] text-ink-soft">La primera fila debe tener los encabezados de columna.</span>
        </label>
      )}

      {error && <p className="text-wine text-[13px] bg-wine/10 rounded-sm px-4 py-3 mt-4">{error}</p>}

      {preview && !result && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-line rounded-md p-6">
            <div className="flex items-center gap-2 mb-1">
              <Upload size={16} className="text-wine" />
              <span className="text-[13.5px] font-semibold">{preview.fileName}</span>
            </div>
            <p className="text-[12.5px] text-ink-soft">{preview.totalRows} filas detectadas. Revisá el mapeo de columnas antes de importar.</p>
          </div>

          <div className="bg-white border border-line rounded-md p-6">
            <h2 className="text-[13px] font-semibold mb-4 text-wine">Mapeo de columnas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {preview.headers.map((h) => (
                <div key={h}>
                  <label className="text-[12px] font-semibold text-ink-soft block mb-1.5 truncate" title={h}>{h}</label>
                  <select
                    value={mapping[h] || ""}
                    onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                    className="w-full border border-line rounded-sm px-2.5 py-2 text-[12.5px] bg-white outline-none focus:border-wine"
                  >
                    {FIELD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {!hasRequired && (
              <p className="text-[12px] text-[#7A4A16] bg-gold/10 rounded-sm px-3 py-2 mt-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Necesitás mapear SKU, nombre y marca. Los precios 2ml / 5ml / 10ml son opcionales.
              </p>
            )}
          </div>

          <div className="bg-white border border-line rounded-md p-6 overflow-x-auto">
            <h2 className="text-[13px] font-semibold mb-4 text-wine">Vista previa (primeras {preview.preview.length} filas)</h2>
            <table className="text-[12px] min-w-[700px]">
              <thead>
                <tr className="border-b border-line text-left text-ink-soft/70">
                  {preview.headers.map((h) => <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((row, i) => (
                  <tr key={i} className="border-b border-line-soft">
                    {preview.headers.map((h) => (
                      <td key={h} className="px-3 py-2 whitespace-nowrap max-w-[160px] truncate">{String(row[h] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCommit}
              disabled={!hasRequired || loading}
              className="flex items-center gap-2 bg-ink text-stone-soft rounded-sm px-6 py-3 text-[13px] font-semibold uppercase tracking-wider hover:bg-wine transition disabled:opacity-50"
            >
              {loading ? "Importando…" : `Importar ${preview.totalRows} filas`} <ArrowRight size={15} />
            </button>
            <button onClick={reset} className="border border-line rounded-sm px-6 py-3 text-[13px] font-semibold">Cancelar</button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white border border-line rounded-md p-8 text-center">
          <CheckCircle2 size={36} className="text-bottle mx-auto mb-3" />
          <h2 className="font-display text-[24px] mb-4">Importación completa</h2>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className="font-display text-[28px] text-bottle">{result.created}</div>
              <div className="text-[12px] text-ink-soft uppercase tracking-wider">Nuevos</div>
            </div>
            <div>
              <div className="font-display text-[28px] text-gold">{result.updated}</div>
              <div className="text-[12px] text-ink-soft uppercase tracking-wider">Actualizados</div>
            </div>
            <div>
              <div className="font-display text-[28px] text-wine">{result.errors.length}</div>
              <div className="text-[12px] text-ink-soft uppercase tracking-wider">Errores</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="text-left bg-wine/5 rounded-sm p-4 mb-6 max-h-[200px] overflow-y-auto">
              {result.errors.map((e, i) => (
                <p key={i} className="text-[12px] text-wine">{e}</p>
              ))}
            </div>
          )}
          <button onClick={reset} className="bg-ink text-stone-soft rounded-sm px-6 py-3 text-[13px] font-semibold uppercase tracking-wider hover:bg-wine transition">
            Importar otro archivo
          </button>
        </div>
      )}
    </div>
  );
}
