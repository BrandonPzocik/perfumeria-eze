import type { Family } from "../types";

const FAMILY_GRADIENTS: Record<Family, [string, string]> = {
  Amaderada: ["#1E40AF", "#0F172A"],
  Floral: ["#2563EB", "#1E3A8A"],
  Cítrica: ["#3B82F6", "#1D4ED8"],
  Oriental: ["#1E3A8A", "#0A1628"],
  Acuática: ["#60A5FA", "#1E40AF"],
  Especiada: ["#2563EB", "#172554"],
};

interface BottleProps {
  family: Family;
  cap?: "gold" | "dark";
}

export default function Bottle({ family, cap = "gold" }: BottleProps) {
  const [c1, c2] = FAMILY_GRADIENTS[family] ?? FAMILY_GRADIENTS.Amaderada;
  const gid = `bottle-${family}`;

  return (
    <svg viewBox="0 0 120 200" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`${gid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </linearGradient>
      </defs>
      <rect x="46" y="10" width="28" height="20" rx="3" fill={cap === "gold" ? "#3B82F6" : "#0F172A"} />
      <rect x="52" y="2" width="16" height="12" rx="2" fill={cap === "gold" ? "#2563EB" : "#1E293B"} />
      <rect x="52" y="30" width="16" height="16" fill={`url(#${gid})`} opacity={0.9} />
      <rect x="26" y="46" width="68" height="130" rx="10" fill={`url(#${gid})`} />
      <rect x="26" y="46" width="68" height="130" rx="10" fill={`url(#${gid}-glass)`} />
      <rect x="26" y="46" width="68" height="130" rx="10" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <rect x="38" y="98" width="44" height="26" rx="1" fill="rgba(248,250,252,0.9)" />
      <rect x="42" y="103" width="36" height="3" rx="1" fill="rgba(30,64,175,0.35)" />
      <rect x="42" y="109" width="28" height="2" rx="1" fill="rgba(30,64,175,0.2)" />
    </svg>
  );
}
