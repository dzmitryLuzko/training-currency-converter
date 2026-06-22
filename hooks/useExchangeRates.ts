import { useState, useEffect, useCallback, useRef } from 'react';
import { ExchangeRates } from '@/types';

export function useExchangeRates() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch rates from the API.
   * - Initial load (`bustCache: false`) drives the full-page `loading` state
   *   and hits the plain `/api/rates` endpoint (served from the 1-hour cache).
   * - Manual refresh (`bustCache: true`) drives the lighter `refreshing` state
   *   and appends a cache-busting param so the user actually gets fresh rates.
   * On failure the previous `exchangeRates` are kept; only `error` is updated.
   */
  const fetchRates = useCallback(async (bustCache = false) => {
    if (bustCache) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const url = bustCache ? `/api/rates?refresh=${Date.now()}` : '/api/rates';
      const response = await fetch(url);
      const data = await response.json();

      if (!isMountedRef.current) return;

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch exchange rates');
      }

      setExchangeRates(data.data);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(
        err.message || 'Failed to fetch exchange rates. Please try again later.'
      );
      console.error('Error fetching rates:', err);
      // Previous rates are intentionally left in place on failure.
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRates();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchRates]);

  // Public action: force-refresh the rates, bypassing the cache.
  const refresh = useCallback(() => fetchRates(true), [fetchRates]);

  return { exchangeRates, loading, refreshing, error, refresh };
}
