import { ConversionResult } from '@/types';
import { formatAmount } from '@/utils/currency';

interface ConversionHistoryProps {
  history: ConversionResult[];
  showHistory: boolean;
  onToggle: () => void;
  onClear: () => void;
  onLoadConversion: (conversion: ConversionResult) => void;
}

/**
 * Recent conversions, presented as a stack of bureau receipt stubs. Each stub
 * reloads its conversion on click; the list is capped at the last 10 entries.
 */
export default function ConversionHistory({
  history,
  showHistory,
  onToggle,
  onClear,
  onLoadConversion,
}: ConversionHistoryProps) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/70">
          Recent
        </h2>
        <div className="flex items-center gap-4">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs font-medium uppercase tracking-wide text-paper/50 underline-offset-4 transition-colors hover:text-alert hover:underline"
            >
              Clear
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-xs font-medium uppercase tracking-wide text-brass underline-offset-4 transition-colors hover:underline"
          >
            {showHistory ? 'Hide' : 'Show'} ({history.length})
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="mt-4 space-y-px overflow-hidden rounded-lg border border-paper/10">
          {history.length === 0 ? (
            <p className="bg-paper/[0.04] px-4 py-6 text-center text-sm text-paper/50">
              No conversions yet — your last 10 will appear here.
            </p>
          ) : (
            history.map((conversion, index) => (
              <button
                key={index}
                onClick={() => onLoadConversion(conversion)}
                className="flex w-full items-center justify-between gap-4 bg-paper/[0.04] px-4 py-3 text-left transition-colors hover:bg-paper/[0.09]"
              >
                <div className="min-w-0">
                  <div className="tabular truncate font-mono text-sm text-paper">
                    {formatAmount(conversion.amount)} {conversion.from}
                    <span className="px-1.5 text-brass">→</span>
                    {formatAmount(conversion.result)} {conversion.to}
                  </div>
                  <div className="tabular mt-0.5 font-mono text-xs text-paper/45">
                    1 {conversion.from} = {formatAmount(conversion.rate, 4)}{' '}
                    {conversion.to}
                  </div>
                </div>
                <time className="shrink-0 font-mono text-[11px] text-paper/40">
                  {new Date(conversion.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}
