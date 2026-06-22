import AmountInput from './AmountInput';
import CurrencySelect from './CurrencySelect';
import SwapButton from './SwapButton';
import RefreshButton from './RefreshButton';
import ConversionResult from './ConversionResult';
import { ExchangeRates } from '@/types';

interface ConverterFormProps {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  result: number | null;
  validationError: string | null;
  exchangeRates: ExchangeRates | null;
  refreshing?: boolean;
  onAmountChange: (value: string) => void;
  onFromCurrencyChange: (value: string) => void;
  onToCurrencyChange: (value: string) => void;
  onSwap: () => void;
  onRefresh: () => void;
}

/**
 * Assembles the converter row — amount, source plate, swap, target plate — all
 * on one line (stacking on mobile), with validation shown directly beneath it.
 */
export default function ConverterForm({
  amount,
  fromCurrency,
  toCurrency,
  result,
  validationError,
  exchangeRates,
  refreshing = false,
  onAmountChange,
  onFromCurrencyChange,
  onToCurrencyChange,
  onSwap,
  onRefresh,
}: ConverterFormProps) {
  const currentRate =
    exchangeRates && fromCurrency && toCurrency
      ? exchangeRates.rates[toCurrency] / exchangeRates.rates[fromCurrency]
      : null;

  return (
    <div>
      {/* Single row: amount and both currency plates with swap between them. */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <AmountInput
          value={amount}
          onChange={onAmountChange}
          error={validationError}
        />
        <CurrencySelect
          value={fromCurrency}
          onChange={onFromCurrencyChange}
          ariaLabel="From currency"
        />
        <SwapButton onClick={onSwap} />
        <CurrencySelect
          value={toCurrency}
          onChange={onToCurrencyChange}
          ariaLabel="To currency"
        />
        <RefreshButton onClick={onRefresh} refreshing={refreshing} />
      </div>

      {/* Validation message, directly below the input row. */}
      {validationError && (
        <p className="mt-2 px-1 text-sm text-alert" role="alert">
          {validationError}
        </p>
      )}

      {/* Result board — hidden while a validation error is showing. */}
      {!validationError && (
        <ConversionResult
          result={result}
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          rate={currentRate}
        />
      )}
    </div>
  );
}
