import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { lockAppScroll } from "../lib/scroll";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
  resetKey?: string | number;
  children: ReactNode;
}

const WIDTHS = {
  sm: "sm:w-[min(430px,100%)]",
  md: "sm:w-[min(560px,100%)]",
  lg: "sm:w-[min(680px,100%)]",
};

export default function Drawer({
  open,
  onClose,
  title,
  headerRight,
  footer,
  width = "sm",
  resetKey,
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const unlock = lockAppScroll();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [open, resetKey]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-ink/55 backdrop-blur-sm z-[60] animate-backdropIn"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed top-0 right-0 h-full w-full ${WIDTHS[width]} bg-stone-soft z-[61] shadow-drawer flex flex-col animate-slideInRight safe-area-inset`}
      >
        {(title || headerRight) && (
          <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-line flex-shrink-0">
            {title ? <span className="eyebrow">{title}</span> : <span />}
            <div className="flex items-center gap-2.5">
              {headerRight}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-line-soft transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer && (
          <div className="flex-shrink-0 border-t border-line bg-stone-soft/95 backdrop-blur-sm safe-area-bottom">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
