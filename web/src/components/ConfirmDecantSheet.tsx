import { formatCurrency } from "../lib/format";
import type { PerfumeVariant } from "../types";

interface ConfirmDecantSheetProps {
  productName: string;
  variant: PerfumeVariant;
  currency?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDecantSheet({
  productName,
  variant,
  currency = "ARS",
  onCancel,
  onConfirm,
}: ConfirmDecantSheetProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/50" onClick={onCancel} aria-hidden />
      <div className="relative w-full sm:max-w-[380px] bg-stone-soft rounded-t-2xl sm:rounded-2xl px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-drawer animate-slideInRight sm:animate-fadeIn">
        <p className="eyebrow mb-2">Agregar al carrito</p>
        <p className="font-display font-bold uppercase tracking-wide text-[22px] leading-tight">
          {productName}
        </p>
        <p className="text-[14px] text-ink-soft mt-1">
          Decant {variant.size} · {formatCurrency(variant.price, currency)}
        </p>
        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-line rounded-lg py-3 text-[13px] font-semibold uppercase tracking-wide"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-primary text-white rounded-lg py-3 text-[13px] font-bold uppercase tracking-wide"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
