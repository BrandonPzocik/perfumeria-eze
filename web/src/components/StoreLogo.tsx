import { useState } from "react";
import { assetUrl } from "../lib/api";

interface StoreLogoProps {
  settingsLogo?: string | null;
  alt: string;
  className?: string;
  hero?: boolean;
}

const PUBLIC_FALLBACKS = ["/logo.png", "/logo.svg"];

function buildSources(settingsLogo?: string | null): string[] {
  const admin = assetUrl(settingsLogo);
  if (admin) return [admin, ...PUBLIC_FALLBACKS];
  return [...PUBLIC_FALLBACKS];
}

export default function StoreLogo({ settingsLogo, alt, className = "", hero = false }: StoreLogoProps) {
  const sources = buildSources(settingsLogo);
  const [idx, setIdx] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  if (exhausted) {
    if (!hero) return null;
    return (
      <div className={`flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/20 rounded-2xl ${className}`}>
        <span className="text-[12px] font-bold uppercase tracking-widest text-white/50 mb-2">Tu logo acá</span>
        <span className="text-[11px] text-white/35 leading-relaxed max-w-[220px]">
          Guardá tu PNG sin fondo en<br />
          <code className="text-accent-soft/90">web/public/logo.png</code>
        </span>
      </div>
    );
  }

  return (
    <img
      src={sources[idx]}
      alt={alt}
      className={className}
      onError={() => {
        if (idx < sources.length - 1) setIdx((i) => i + 1);
        else setExhausted(true);
      }}
    />
  );
}
