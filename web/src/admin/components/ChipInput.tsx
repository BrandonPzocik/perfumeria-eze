import { useState } from "react";
import { X } from "lucide-react";

interface ChipInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function ChipInput({ label, values, onChange, placeholder }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  const addChip = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };

  return (
    <div>
      <label className="text-[12px] font-semibold text-ink-soft block mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 border border-line rounded-sm px-2.5 py-2 bg-white focus-within:border-wine">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 bg-[#F4F1EA] text-[12px] px-2 py-1 rounded-full">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addChip();
            }
          }}
          onBlur={addChip}
          placeholder={placeholder || "Escribí y presioná Enter"}
          className="flex-1 min-w-[100px] outline-none text-[13px] py-1"
        />
      </div>
    </div>
  );
}
