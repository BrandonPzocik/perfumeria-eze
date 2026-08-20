import { useRef, useState } from "react";
import { Upload, X, Star, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { api, assetUrl } from "../../lib/api";

export interface ManagedImage {
  id: string;
  url: string;
  isMain: boolean;
}

interface ImageManagerProps {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
}

export default function ImageManager({ images, onChange }: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      const res = await api.upload<{ urls: string[] }>("/upload/multiple", formData);
      const newImages: ManagedImage[] = res.urls.map((url, i) => ({
        id: `${Date.now()}-${i}`,
        url,
        isMain: images.length === 0 && i === 0,
      }));
      onChange([...images, ...newImages]);
    } catch (err: any) {
      alert(err.message || "No se pudieron subir las imágenes.");
    } finally {
      setUploading(false);
    }
  };

  const setMain = (id: string) => onChange(images.map((img) => ({ ...img, isMain: img.id === id })));
  const remove = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((i) => i.isMain)) filtered[0].isMain = true;
    onChange(filtered);
  };
  const move = (index: number, dir: -1 | 1) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <label className="text-[12px] font-semibold text-ink-soft block mb-1.5">Imágenes</label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors mb-4 ${
          dragOver ? "border-wine bg-wine/5" : "border-line hover:border-ink-soft"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-ink-soft">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-[12.5px]">Subiendo…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-soft">
            <Upload size={22} />
            <span className="text-[12.5px]">Arrastrá imágenes acá o hacé clic para elegir archivos</span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="relative group border border-line rounded-sm overflow-hidden aspect-square bg-[#F4F1EA]">
              <img src={assetUrl(img.url) || ""} alt="" className="w-full h-full object-cover" />
              {img.isMain && (
                <span className="absolute top-1 left-1 bg-gold text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm">Principal</span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="bg-white/90 rounded p-1"><ArrowLeft size={12} /></button>
                  <button type="button" onClick={() => setMain(img.id)} className="bg-white/90 rounded p-1"><Star size={12} fill={img.isMain ? "#B79358" : "none"} /></button>
                  <button type="button" onClick={() => move(i, 1)} className="bg-white/90 rounded p-1"><ArrowRight size={12} /></button>
                </div>
                <button type="button" onClick={() => remove(img.id)} className="bg-white/90 rounded p-1"><X size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
