'use client';

import { Suspense, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import PageFooter from '@/components/PageFooter';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConverterForm from '@/components/ConverterForm';
import ConversionHistory from '@/components/ConversionHistory';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useConverter } from '@/hooks/useConverter';

function Converter() {
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Live exchange rates (with fallback + mock handled server-side).
  const { exchangeRates, loading, refreshing, error, refresh } =
    useExchangeRates();

  // Conversion state: auto-converts on every input/selection change.
  const {
    amount,
    fromCurrency,
    toCurrency,
    result,
    validationError,
    history,
    setAmount,
    handleFromChange,
    handleToChange,
    handleSwap,
    loadFromHistory,
    clearConversionHistory,
  } = useConverter(exchangeRates);

  return (
    <>
      <PageHeader
        title="Change Bureau"
        subtitle="Convert across 10 currencies at live mid-market rates — no button, it updates as you type."
      />

      {/* The ticket: ivory surface with a brass top rule. */}
      <div className="overflow-hidden rounded-xl bg-paper shadow-2xl shadow-black/40 ring-1 ring-black/5">
        <div className="h-1 w-full bg-brass" />
        <div className="p-6 sm:p-8">
          <ErrorMessage message={error} />

          {loading ? (
            <LoadingSpinner message="Loading exchange rates..." />
          ) : (
            <ConverterForm
              amount={amount}
              fromCurrency={fromCurrency}
              toCurrency={toCurrency}
              result={result}
              validationError={validationError}
              exchangeRates={exchangeRates}
              refreshing={refreshing}
              onAmountChange={setAmount}
              onFromCurrencyChange={handleFromChange}
              onToCurrencyChange={handleToChange}
              onSwap={handleSwap}
              onRefresh={refresh}
            />
          )}
        </div>
      </div>

      <ConversionHistory
        history={history}
        showHistory={showHistory}
        onToggle={() => setShowHistory(!showHistory)}
        onClear={clearConversionHistory}
        onLoadConversion={(conversion) => {
          loadFromHistory(conversion);
          setShowHistory(false);
        }}
      />

      <PageFooter lastUpdated={exchangeRates?.timestamp} />
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
        {/* useConverter reads URL params, so the tree needs a Suspense boundary. */}
        <Suspense
          fallback={<LoadingSpinner message="Preparing the bureau..." />}
        >
          <Converter />
        </Suspense>
      </div>
    </main>
  );
}
