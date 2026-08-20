import type { ScentNotes } from "../types";

const ROWS: { label: string; key: keyof ScentNotes; width: string }[] = [
  { label: "Salida", key: "salida", width: "58%" },
  { label: "Corazón", key: "corazon", width: "78%" },
  { label: "Fondo", key: "fondo", width: "100%" },
];

export default function ScentPyramid({ notas }: { notas: ScentNotes }) {
  return (
    <div className="flex flex-col gap-4">
      {ROWS.map((r) => (
        <div key={r.key} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="eyebrow w-16 sm:w-[68px] text-wine flex-shrink-0">{r.label}</span>
            <div className="flex-1 h-1 bg-line relative rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
                style={{ width: r.width }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-[76px] sm:pl-[80px]">
            {notas[r.key].map((n) => (
              <span key={n} className="text-[11.5px] px-3 py-1.5 rounded-pill border border-line bg-stone hover:border-wine/30 transition-colors">
                {n}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
