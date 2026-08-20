import { Check } from "lucide-react";
import { useToastStore } from "../hooks/useToastStore";

export default function Toast() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-primary-deep text-stone-soft px-5 py-3 rounded-lg text-[13px] flex items-center gap-2.5 shadow-xl shadow-primary/30 animate-fadeIn max-w-[90vw] border border-accent/20">
      <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
        <Check size={13} className="text-accent-soft" />
      </div>
      {message}
    </div>
  );
}
