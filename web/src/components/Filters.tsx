import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FAMILIES } from "../data/constants";
import type { Gender, Tag } from "../types";

interface FiltersProps {
  activeFamily: string;
  setActiveFamily: (v: string) => void;
  activeGender: string;
  setActiveGender: (v: string) => void;
  activeTag: string;
  setActiveTag: (v: string) => void;
  activeBrand: string;
  setActiveBrand: (v: string) => void;
  brands: string[];
}

const GENDERS: (Gender | "Todos")[] = ["Todos", "Femenino", "Masculino"];
const TAGS: { key: Tag | "Todos"; label: string }[] = [
  { key: "Todos", label: "Todos" },
  { key: "nuevo", label: "Nuevos" },
  { key: "oferta", label: "Ofertas" },
  { key: "mas-vendido", label: "Más vendidos" },
];

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold tracking-wide px-4 py-2.5 rounded-pill border whitespace-nowrap transition-all duration-200 ${
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : "border-line bg-white hover:border-primary/40 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <span className="eyebrow opacity-70 block mb-2.5">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function Filters({
  activeFamily, setActiveFamily,
  activeGender, setActiveGender,
  activeTag, setActiveTag,
  activeBrand, setActiveBrand,
  brands,
}: FiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const activeCount = [
    activeFamily !== "Todas",
    activeGender !== "Todos",
    activeTag !== "Todos",
    activeBrand !== "Todas",
  ].filter(Boolean).length;

  const clearAll = () => {
    setActiveFamily("Todas");
    setActiveGender("Todos");
    setActiveTag("Todos");
    setActiveBrand("Todas");
  };

  const filterContent = (
    <>
      <FilterGroup label="Familia olfativa">
        {["Todas", ...FAMILIES].map((f) => (
          <Pill key={f} active={activeFamily === f} onClick={() => setActiveFamily(f)}>{f}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Género">
        {GENDERS.map((g) => (
          <Pill key={g} active={activeGender === g} onClick={() => setActiveGender(g)}>{g}</Pill>
        ))}
      </FilterGroup>
      <FilterGroup label="Etiquetas">
        {TAGS.map((t) => (
          <Pill key={t.key} active={activeTag === t.key} onClick={() => setActiveTag(t.key)}>{t.label}</Pill>
        ))}
      </FilterGroup>
      {brands.length > 0 && (
        <FilterGroup label="Marca">
          <select
            value={activeBrand}
            onChange={(e) => setActiveBrand(e.target.value)}
            className="text-xs font-semibold px-4 py-2.5 rounded-pill border border-line bg-stone-soft outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="Todas">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </FilterGroup>
      )}
    </>
  );

  return (
    <>
      {/* Desktop horizontal filters */}
      <div className="hidden md:block sticky top-[72px] z-20 bg-stone/95 backdrop-blur-sm pb-4 mb-3 -mx-1 px-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1.5 items-center">
          <span className="text-[11px] flex items-center gap-1.5 text-ink-soft pr-1 flex-shrink-0">
            <SlidersHorizontal size={13} /> Filtrar
          </span>
          {["Todas", ...FAMILIES].map((f) => (
            <Pill key={f} active={activeFamily === f} onClick={() => setActiveFamily(f)}>{f}</Pill>
          ))}
          <div className="w-px h-6 bg-line mx-0.5 flex-shrink-0" />
          {GENDERS.map((g) => (
            <Pill key={g} active={activeGender === g} onClick={() => setActiveGender(g)}>{g}</Pill>
          ))}
          <div className="w-px h-6 bg-line mx-0.5 flex-shrink-0" />
          {TAGS.map((t) => (
            <Pill key={t.key} active={activeTag === t.key} onClick={() => setActiveTag(t.key)}>{t.label}</Pill>
          ))}
          {brands.length > 0 && (
            <>
              <div className="w-px h-6 bg-line mx-0.5 flex-shrink-0" />
              <select
                value={activeBrand}
                onChange={(e) => setActiveBrand(e.target.value)}
                className="text-xs font-semibold px-4 py-2.5 rounded-pill border border-line bg-stone-soft outline-none cursor-pointer flex-shrink-0"
              >
                <option value="Todas">Todas las marcas</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </>
          )}
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-[11px] font-semibold text-wine ml-1 flex-shrink-0 hover:underline">
              Limpiar ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="md:hidden sticky top-[64px] z-20 bg-stone/95 backdrop-blur-sm py-3 mb-2 flex items-center gap-2">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-pill border border-line bg-stone-soft"
        >
          <SlidersHorizontal size={14} />
          Filtros
          {activeCount > 0 && (
            <span className="bg-wine text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-[11px] font-semibold text-wine hover:underline">
            Limpiar
          </button>
        )}
      </div>

      {/* Mobile filter sheet */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[50] animate-backdropIn md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[51] bg-stone-soft rounded-t-2xl max-h-[85vh] flex flex-col animate-slideInUp md:hidden shadow-drawer">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
              <span className="eyebrow">Filtros</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Cerrar" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-line-soft">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 py-4 flex-1">
              {filterContent}
            </div>
            <div className="p-4 border-t border-line flex-shrink-0">
              <button onClick={() => setMobileOpen(false)} className="btn-primary w-full">
                Ver resultados
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
