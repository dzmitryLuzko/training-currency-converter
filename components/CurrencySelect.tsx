import { CURRENCIES } from '@/utils/currency';

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  ariaLabel?: string;
}

/**
 * Native currency dropdown — styled to read as a bureau plate while keeping a
 * real <select> for accessibility and keyboard support.
 */
export default function CurrencySelect({
  value,
  onChange,
  label,
  ariaLabel,
}: CurrencySelectProps) {
  return (
    <div className="relative w-full sm:flex-1">
      {label && (
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full cursor-pointer appearance-none rounded-md border border-line bg-white/70 py-3 pl-4 pr-10 text-base font-medium text-ink outline-none transition-colors hover:border-brass/50 focus:border-brass focus:ring-2 focus:ring-brass/30"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          className="h-4 w-4 text-brass"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
