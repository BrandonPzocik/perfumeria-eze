import type { ScentNotes } from "../types";

const ROWS: { label: string; key: keyof ScentNotes }[] = [
  { label: "Salida", key: "salida" },
  { label: "Corazón", key: "corazon" },
  { label: "Fondo", key: "fondo" },
];

export default function ScentPyramid({ notas }: { notas: ScentNotes }) {
  return (
    <div className="flex flex-col gap-4">
      {ROWS.map((r) => (
        <div key={r.key}>
          <span className="eyebrow text-wine block mb-2">{r.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {notas[r.key].length === 0 ? (
              <span className="text-[12.5px] text-ink-soft">—</span>
            ) : (
              notas[r.key].map((n) => (
                <span key={n} className="text-[11.5px] px-3 py-1.5 rounded-pill border border-line bg-stone">
                  {n}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
