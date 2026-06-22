import { renderHook, waitFor, act } from '@testing-library/react';
import { useExchangeRates } from './useExchangeRates';

// Mock fetch globally
global.fetch = jest.fn();

describe('useExchangeRates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should fetch exchange rates on mount', async () => {
    const mockRates = {
      base: 'USD',
      rates: { USD: 1, EUR: 0.85, GBP: 0.73 },
      timestamp: Date.now(),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockRates }),
    });

    const { result } = renderHook(() => useExchangeRates());

    expect(result.current.loading).toBe(true);
    expect(result.current.exchangeRates).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.exchangeRates).toEqual(mockRates);
    expect(result.current.error).toBe(null);
    expect(global.fetch).toHaveBeenCalledWith('/api/rates');
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'API Error' }),
    });

    const { result } = renderHook(() => useExchangeRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.exchangeRates).toBe(null);
    expect(result.current.error).toBe('API Error');
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useExchangeRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.exchangeRates).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle fetch failure with default error message', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error());

    const { result } = renderHook(() => useExchangeRates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Failed to fetch exchange rates. Please try again later.'
    );
  });

  it('should not update state if component unmounts before fetch completes', async () => {
    const mockRates = {
      base: 'USD',
      rates: { USD: 1, EUR: 0.85 },
    };

    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

    const { result, unmount } = renderHook(() => useExchangeRates());

    expect(result.current.loading).toBe(true);

    // Unmount before fetch completes
    unmount();

    // Resolve the fetch after unmount
    resolvePromise!({
      json: async () => ({ success: true, data: mockRates }),
    });

    // Wait a bit to ensure no updates occur
    await new Promise((resolve) => setTimeout(resolve, 100));

    // State should remain as it was before unmount
    expect(result.current.loading).toBe(true);
  });

  it('should fetch from correct API endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: {} }),
    });

    renderHook(() => useExchangeRates());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/rates');
    });
  });

  describe('refresh', () => {
    it('refetches fresh rates, busting the cache (initial endpoint stays clean)', async () => {
      const first = { base: 'USD', rates: { USD: 1, EUR: 0.85 }, timestamp: 1 };
      const second = { base: 'USD', rates: { USD: 1, EUR: 0.9 }, timestamp: 2 };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({ success: true, data: first }) })
        .mockResolvedValueOnce({ json: async () => ({ success: true, data: second }) });

      const { result } = renderHook(() => useExchangeRates());
      await waitFor(() => expect(result.current.exchangeRates).toEqual(first));

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.exchangeRates).toEqual(second);

      const calls = (global.fetch as jest.Mock).mock.calls;
      expect(calls[0][0]).toBe('/api/rates'); // mount: clean
      expect(calls[1][0]).toMatch(/^\/api\/rates\?refresh=\d+$/); // refresh: cache-busted
    });

    it('sets `refreshing` (not `loading`) while a manual refresh is in flight', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: { base: 'USD', rates: { USD: 1 } } }),
      });

      const { result } = renderHook(() => useExchangeRates());
      await waitFor(() => expect(result.current.loading).toBe(false));

      let resolveRefresh!: (value: any) => void;
      (global.fetch as jest.Mock).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
      );

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => expect(result.current.refreshing).toBe(true));
      expect(result.current.loading).toBe(false); // full-page loader not triggered

      await act(async () => {
        resolveRefresh({
          json: async () => ({
            success: true,
            data: { base: 'USD', rates: { USD: 1, EUR: 0.8 } },
          }),
        });
      });

      await waitFor(() => expect(result.current.refreshing).toBe(false));
    });

    it('keeps the previous rates and surfaces an error when a refresh fails', async () => {
      const good = { base: 'USD', rates: { USD: 1, EUR: 0.85 }, timestamp: 1 };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ success: true, data: good }),
      });

      const { result } = renderHook(() => useExchangeRates());
      await waitFor(() => expect(result.current.exchangeRates).toEqual(good));

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Refresh failed'));

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error).toBe('Refresh failed');
      expect(result.current.exchangeRates).toEqual(good); // unchanged
    });
  });
});
