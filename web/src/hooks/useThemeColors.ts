import { useEffect } from "react";
import { useSettingsStore } from "./useSettingsStore";

function darken(hex: string, amount = 0.25): string {
  const n = hex.replace("#", "");
  if (n.length !== 6) return hex;
  const r = Math.max(0, Math.round(parseInt(n.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(n.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(n.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function lighten(hex: string, amount = 0.35): string {
  const n = hex.replace("#", "");
  if (n.length !== 6) return hex;
  const r = Math.min(255, Math.round(parseInt(n.slice(0, 2), 16) + (255 - parseInt(n.slice(0, 2), 16)) * amount));
  const g = Math.min(255, Math.round(parseInt(n.slice(2, 4), 16) + (255 - parseInt(n.slice(2, 4), 16)) * amount));
  const b = Math.min(255, Math.round(parseInt(n.slice(4, 6), 16) + (255 - parseInt(n.slice(4, 6), 16)) * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function useThemeColors() {
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", settings.primaryColor);
    root.style.setProperty("--color-primary-deep", darken(settings.primaryColor, 0.3));
    root.style.setProperty("--color-accent", settings.accentColor);
    root.style.setProperty("--color-accent-soft", lighten(settings.accentColor, 0.4));
  }, [settings.primaryColor, settings.accentColor]);
}
