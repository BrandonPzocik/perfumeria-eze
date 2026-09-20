import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import Bottle from "../../components/Bottle";
import { TagBadge } from "../../components/Badges";
import { useAdminPerfumesStore } from "../hooks/useAdminPerfumesStore";
import { useSettingsStore } from "../../hooks/useSettingsStore";
import { formatCurrency } from "../../lib/format";
import { assetUrl } from "../../lib/api";
import { perfumeImageUrl } from "../../lib/product";
import type { Perfume } from "../../types";

function SortCard({ product }: { product: Perfume }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  const currency = useSettingsStore((s) => s.settings.currency);
  const imageUrl = assetUrl(perfumeImageUrl(product));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`flex flex-col select-none ${isDragging ? "opacity-80 scale-[1.02]" : ""}`}
    >
      <div
        className={`relative rounded-card overflow-hidden border image-placeholder cursor-grab active:cursor-grabbing ${
          isDragging ? "border-accent shadow-card-hover" : "border-line-soft"
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="aspect-[3/4] relative">
          <div className="absolute top-2 left-2 z-10 flex gap-1 flex-wrap max-w-[70%]">
            {product.tags.slice(0, 2).map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
          <div className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-stone-soft/95 flex items-center justify-center shadow-card text-ink-soft">
            <GripVertical size={16} />
          </div>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="absolute inset-y-3 left-[18%] right-[18%]">
              <Bottle family={product.family} />
            </div>
          )}
        </div>
      </div>
      <div className="pt-2.5 flex flex-col gap-0.5 pointer-events-none">
        <span className="eyebrow text-ink-soft/60 text-[10px]">{product.brand}</span>
        <h3 className="font-display font-bold uppercase tracking-wide leading-tight text-[15px] sm:text-[17px]">
          {product.name}
        </h3>
        <span className="text-xs text-ink-soft">{product.type} · {product.size}</span>
        <span className="font-semibold text-[15px] mt-0.5">{formatCurrency(product.price, currency)}</span>
      </div>
    </article>
  );
}

export default function AdminOrdenar() {
  const { items, loading, error, fetchAll, reorder } = useAdminPerfumesStore();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const visible = useMemo(() => items.filter((p) => p.visible), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = visible.findIndex((p) => p.id === active.id);
    const newIndex = visible.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(visible, oldIndex, newIndex);
    const queue = [...moved];
    const merged = items.map((p) => (p.visible ? queue.shift()! : p));

    setSaving(true);
    setSavedAt(null);
    await reorder(merged.map((p) => p.id));
    setSaving(false);
    setSavedAt(Date.now());
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1240px]">
      <div className="mb-6 sm:mb-8">
        <span className="eyebrow">Catálogo público</span>
        <h1 className="font-display text-[28px] mb-1">Ordenar</h1>
        <p className="text-[13.5px] text-ink-soft max-w-[560px]">
          Arrastrá las tarjetas como las ves en el catálogo. El primer lugar es el de arriba a la izquierda.
          {saving ? " Guardando…" : savedAt ? " Orden guardado." : ""}
        </p>
      </div>

      {error && <p className="text-wine text-[13px] mb-4">{error}</p>}

      {loading && items.length === 0 ? (
        <p className="text-ink-soft text-[13.5px]">Cargando catálogo…</p>
      ) : visible.length === 0 ? (
        <p className="text-ink-soft text-[13.5px]">No hay perfumes visibles para ordenar.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visible.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-[30px]">
              {visible.map((p) => (
                <SortCard key={p.id} product={p} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
