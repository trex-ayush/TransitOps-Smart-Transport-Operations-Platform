import { Info } from "lucide-react";
import Tooltip from "./Tooltip";

export default function Select({ label, hint, error, options = [], placeholder, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-forest/50">
          {label}
          {hint && (
            <Tooltip text={hint}>
              <Info size={13} strokeWidth={1.5} className="text-sage" />
            </Tooltip>
          )}
        </span>
      )}
      <select
        className={`w-full rounded-full border bg-card px-4 py-2.5 text-sm text-forest transition-colors focus:outline-none ${
          error ? "border-rose-300 focus:border-rose-400" : "border-transparent focus:border-sage"
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block px-1 text-xs text-rose-600">{error}</span>}
    </label>
  );
}
