import { MessageCircle } from "lucide-react";
import { useSettingsStore } from "../hooks/useSettingsStore";

export default function WhatsAppFAB() {
  const number = useSettingsStore((s) => s.settings.whatsappNumber);
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:left-6 sm:right-auto z-30 w-[54px] h-[54px] rounded-full bg-[#25D366] flex items-center justify-center shadow-xl shadow-[#25D366]/30 text-white hover:scale-105 hover:brightness-105 transition-all duration-200"
    >
      <MessageCircle size={24} />
    </a>
  );
}
