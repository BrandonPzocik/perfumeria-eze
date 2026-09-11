import { formatThousands, parseMoneyDigits } from "../../lib/format";

interface MoneyInputProps {
  value: string | number;
  onChange: (digits: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function MoneyInput({
  value,
  onChange,
  placeholder = "0",
  required,
  className = "input",
}: MoneyInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      required={required}
      className={className}
      placeholder={placeholder}
      value={formatThousands(value)}
      onChange={(e) => onChange(parseMoneyDigits(e.target.value))}
    />
  );
}
