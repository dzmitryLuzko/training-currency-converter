import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CURRENCIES, validateAmount, convertCurrency } from '@/utils/currency';
import { saveConversion, getConversionHistory, clearConversionHistory as clearStorage } from '@/utils/storage';
import { ConversionResult, ExchangeRates } from '@/types';

export function useConverter(exchangeRates: ExchangeRates | null) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionResult[]>([]);

  // Initialize from URL parameters
  useEffect(() => {
    const urlAmount = searchParams.get('amount');
    const urlFrom = searchParams.get('from');
    const urlTo = searchParams.get('to');

    if (urlAmount) {
      setAmount(urlAmount);
    }

    const isValidCode = (code: string | null): code is string =>
      !!code && CURRENCIES.some((c) => c.code === code);

    if (isValidCode(urlFrom)) {
      setFromCurrency(urlFrom);
    }

    if (isValidCode(urlTo)) {
      // Enforce the "from !== to" invariant here too: a deep link such as
      // ?from=USD&to=USD must not produce a meaningless X -> X conversion.
      // The dropdown handlers guard the interactive path; this guards the URL.
      const effectiveFrom = isValidCode(urlFrom) ? urlFrom : fromCurrency;
      if (urlTo === effectiveFrom) {
        const fallback = CURRENCIES.find((c) => c.code !== effectiveFrom);
        setToCurrency(fallback ? fallback.code : urlTo);
      } else {
        setToCurrency(urlTo);
      }
    }

    setHistory(getConversionHistory());
  }, [searchParams]);

  // Update URL parameters
  const updateURL = useCallback((amt: string, from: string, to: string) => {
    const params = new URLSearchParams();
    params.set('amount', amt);
    params.set('from', from);
    params.set('to', to);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // Perform conversion
  const performConversion = useCallback(() => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      setResult(null);
      return;
    }

    // Only clear error if we actually have rates to convert with
    if (!exchangeRates) {
      return;
    }

    setValidationError(null);

    try {
      const amountNum = parseFloat(amount);
      const fromRate = exchangeRates.rates[fromCurrency];
      const toRate = exchangeRates.rates[toCurrency];

      if (!fromRate || !toRate) {
        return;
      }

      const convertedAmount = convertCurrency(amountNum, fromRate, toRate);
      setResult(convertedAmount);

      const conversion: ConversionResult = {
        from: fromCurrency,
        to: toCurrency,
        amount: amountNum,
        result: convertedAmount,
        rate: toRate / fromRate,
        timestamp: Date.now(),
      };

      saveConversion(conversion);
      setHistory(getConversionHistory());

      updateURL(amount, fromCurrency, toCurrency);
    } catch (err: any) {
      console.error('Conversion error:', err);
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates, updateURL]);

  // Auto-convert on input change
  useEffect(() => {
    // Always validate the amount, even if rates aren't loaded yet
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      setResult(null);
      return;
    }

    // Only perform conversion if we have all required data
    if (fromCurrency && toCurrency && exchangeRates) {
      performConversion();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates, performConversion]);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  // Change the "from" currency. If the user picks the currency already used on
  // the "to" side, swap them instead — the two sides must never be identical
  // (a USD → USD conversion is meaningless).
  const handleFromChange = useCallback(
    (value: string) => {
      if (value === toCurrency) {
        setToCurrency(fromCurrency);
      }
      setFromCurrency(value);
    },
    [fromCurrency, toCurrency]
  );

  // Mirror of handleFromChange for the "to" side.
  const handleToChange = useCallback(
    (value: string) => {
      if (value === fromCurrency) {
        setFromCurrency(toCurrency);
      }
      setToCurrency(value);
    },
    [fromCurrency, toCurrency]
  );

  const loadFromHistory = useCallback((conversion: ConversionResult) => {
    setAmount(conversion.amount.toString());
    setFromCurrency(conversion.from);
    setToCurrency(conversion.to);
  }, []);

  const clearConversionHistory = useCallback(() => {
    clearStorage();
    setHistory([]);
  }, []);

  return {
    amount,
    fromCurrency,
    toCurrency,
    result,
    validationError,
    history,
    setAmount,
    setFromCurrency,
    setToCurrency,
    handleFromChange,
    handleToChange,
    handleSwap,
    loadFromHistory,
    clearConversionHistory,
  };
}
