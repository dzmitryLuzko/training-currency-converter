import { CURRENCIES, formatAmount } from '@/utils/currency';

interface ConversionResultProps {
  result: number | null;
  fromCurrency: string;
  toCurrency: string;
  rate: number | null;
}

/**
 * The "living board" — the signature element. The converted figure is set in
 * large tabular mono and flips in on every change (via the `key`), echoing a
 * bureau rate board that updates without a button press.
 */
export default function ConversionResult({
  result,
  fromCurrency,
  toCurrency,
  rate,
}: ConversionResultProps) {
  if (result === null) return null;

  const toCurrencyData = CURRENCIES.find((c) => c.code === toCurrency);

  return (
    <div className="mt-6 rounded-lg border border-brass/30 bg-ink px-6 py-7 text-paper">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-paper/60">
          You receive
        </span>
        <span className="tabular font-mono text-xs text-paper/50">
          {fromCurrency} → {toCurrency}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        {/* Symbol + amount share one text node so it reads as "€85.00". */}
        <span
          key={result}
          className="board-flip tabular font-mono text-5xl font-semibold leading-none text-paper"
        >
          {toCurrencyData?.symbol}
          {formatAmount(result)}
        </span>
        <span className="font-mono text-lg text-paper/70">{toCurrency}</span>
      </div>

      {rate !== null && (
        <>
          <div className="perforation my-5 opacity-60" />
          <div className="tabular font-mono text-sm text-brass">
            1 {fromCurrency} = {formatAmount(rate, 4)} {toCurrency}
          </div>
        </>
      )}
    </div>
  );
}
