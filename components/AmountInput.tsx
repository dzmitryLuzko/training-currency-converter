interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  label?: string;
}

/**
 * Amount field. The figure is set in tabular mono to match the result board.
 */
export default function AmountInput({
  value,
  onChange,
  error,
  label,
}: AmountInputProps) {
  return (
    <div className="w-full sm:flex-1">
      {label && (
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          {label}
        </label>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter amount"
        step="1"
        min="0"
        aria-label="Amount"
        aria-invalid={error ? true : undefined}
        className={`tabular w-full rounded-md border bg-white/70 px-4 py-3 font-mono text-lg text-ink outline-none transition-colors placeholder:text-sm placeholder:text-muted/50 focus:border-brass focus:ring-2 focus:ring-brass/30 ${
          error ? 'border-alert' : 'border-line'
        }`}
      />
    </div>
  );
}
