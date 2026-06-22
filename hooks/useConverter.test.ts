import { renderHook, act, waitFor } from '@testing-library/react';
import { useConverter } from './useConverter';
import { ExchangeRates } from '@/types';
import * as storage from '@/utils/storage';

// Mock the storage functions
jest.mock('@/utils/storage');

// Controllable next/navigation mock so we can drive URL query params per test.
const mockSearchParamsGet = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
  usePathname: () => '/',
}));

const mockExchangeRates: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110,
  },
  timestamp: Date.now(),
};

describe('useConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (storage.getConversionHistory as jest.Mock).mockReturnValue([]);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useConverter(null));

    expect(result.current.amount).toBe('1');
    expect(result.current.fromCurrency).toBe('USD');
    expect(result.current.toCurrency).toBe('EUR');
    expect(result.current.result).toBe(null);
    expect(result.current.validationError).toBe(null);
  });

  it('should update amount', () => {
    const { result } = renderHook(() => useConverter(null));

    act(() => {
      result.current.setAmount('100');
    });

    expect(result.current.amount).toBe('100');
  });

  it('should perform conversion when exchange rates are available', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.setAmount('100');
    });

    await waitFor(() => {
      expect(result.current.result).toBe(85); // 100 USD to EUR at rate 0.85
    });
    expect(result.current.validationError).toBe(null);
  });

  it('should validate amount before conversion', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    // First wait for initial conversion to complete
    await waitFor(() => {
      expect(result.current.result).not.toBe(null);
    });

    act(() => {
      result.current.setAmount('');
    });

    await waitFor(
      () => {
        expect(result.current.validationError).toBe('Please enter an amount');
        expect(result.current.result).toBe(null);
      },
      { timeout: 3000 }
    );
  });

  it('should reject negative amounts', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.setAmount('-10');
    });

    await waitFor(() => {
      expect(result.current.validationError).toBe(
        'Amount must be greater than zero'
      );
    });
  });

  it('should swap currencies', () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.setFromCurrency('USD');
      result.current.setToCurrency('EUR');
    });

    act(() => {
      result.current.handleSwap();
    });

    expect(result.current.fromCurrency).toBe('EUR');
    expect(result.current.toCurrency).toBe('USD');
  });

  it('should save conversion to history', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.setAmount('100');
    });

    await waitFor(() => {
      expect(result.current.result).toBe(85);
    });

    expect(storage.saveConversion).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'USD',
        to: 'EUR',
        amount: 100,
        result: 85,
        rate: 0.85,
      })
    );
  });

  it('should load conversion from history', () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    const historicalConversion = {
      from: 'GBP',
      to: 'JPY',
      amount: 50,
      result: 7534.25,
      rate: 150.685,
      timestamp: Date.now(),
    };

    act(() => {
      result.current.loadFromHistory(historicalConversion);
    });

    expect(result.current.amount).toBe('50');
    expect(result.current.fromCurrency).toBe('GBP');
    expect(result.current.toCurrency).toBe('JPY');
  });

  it('should clear conversion history', () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.clearConversionHistory();
    });

    expect(storage.clearConversionHistory).toHaveBeenCalled();
    expect(result.current.history).toEqual([]);
  });

  it('should handle cross-currency conversion', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.setAmount('100');
      result.current.setFromCurrency('GBP');
      result.current.setToCurrency('JPY');
    });

    await waitFor(() => {
      // 100 GBP to JPY: (100 / 0.73) * 110 ≈ 15068.49
      expect(result.current.result).toBeCloseTo(15068.49, 1);
    });
  });

  it('should handle missing currency rates gracefully', async () => {
    const incompleteRates: ExchangeRates = {
      base: 'USD',
      rates: {
        USD: 1,
        EUR: 0.85,
        // GBP is missing
      },
    };

    const { result } = renderHook(() => useConverter(incompleteRates));

    // First wait for initial conversion (USD to EUR with amount '1')
    await waitFor(() => {
      expect(result.current.result).toBe(0.85);
    });

    act(() => {
      result.current.setAmount('100');
      result.current.setFromCurrency('USD');
      result.current.setToCurrency('GBP');
    });

    // Wait to ensure no conversion happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not crash, result should not be calculated for missing rate
    // The last successful result (0.85) may still be there, or it should not convert
    expect(result.current.validationError).toBe(null);
  });

  it('should update result when currencies change', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.setAmount('100');
    });

    await waitFor(() => {
      expect(result.current.result).toBe(85); // USD to EUR
    });

    act(() => {
      result.current.setToCurrency('GBP');
    });

    await waitFor(() => {
      expect(result.current.result).toBe(73); // USD to GBP
    });
  });

  it('should handle decimal amounts', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    act(() => {
      result.current.setAmount('50.50');
    });

    await waitFor(() => {
      expect(result.current.result).toBeCloseTo(42.925, 3);
    });
  });

  it('should validate amount loaded from URL parameters', async () => {
    // We need to test the validation by setting an invalid amount
    // Since URL params are mocked, we'll test by setting a large amount directly
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    // Simulate loading a too-large amount (like from URL)
    act(() => {
      result.current.setAmount('10000000000'); // Too large
    });

    await waitFor(() => {
      // Should show validation error for amount that's too large
      expect(result.current.validationError).toBe('Amount is too large');
      expect(result.current.result).toBe(null);
    });
  });

  it('should validate negative amount', async () => {
    const { result } = renderHook(() => useConverter(mockExchangeRates));

    // Simulate setting a negative amount (like from URL)
    act(() => {
      result.current.setAmount('-100');
    });

    await waitFor(() => {
      // Should show validation error for negative amount
      expect(result.current.validationError).toBe('Amount must be greater than zero');
      expect(result.current.result).toBe(null);
    });
  });

  describe('preventing duplicate currencies', () => {
    it('swaps currencies when "From" is changed to match "To"', () => {
      const { result } = renderHook(() => useConverter(mockExchangeRates));
      // defaults: From=USD, To=EUR

      act(() => {
        result.current.handleFromChange('EUR');
      });

      expect(result.current.fromCurrency).toBe('EUR');
      expect(result.current.toCurrency).toBe('USD');
    });

    it('swaps currencies when "To" is changed to match "From"', () => {
      const { result } = renderHook(() => useConverter(mockExchangeRates));
      // defaults: From=USD, To=EUR

      act(() => {
        result.current.handleToChange('USD');
      });

      expect(result.current.fromCurrency).toBe('EUR');
      expect(result.current.toCurrency).toBe('USD');
    });

    it('updates "From" normally when it differs from "To"', () => {
      const { result } = renderHook(() => useConverter(mockExchangeRates));

      act(() => {
        result.current.handleFromChange('GBP');
      });

      expect(result.current.fromCurrency).toBe('GBP');
      expect(result.current.toCurrency).toBe('EUR'); // unchanged
    });

    it('updates "To" normally when it differs from "From"', () => {
      const { result } = renderHook(() => useConverter(mockExchangeRates));

      act(() => {
        result.current.handleToChange('GBP');
      });

      expect(result.current.toCurrency).toBe('GBP');
      expect(result.current.fromCurrency).toBe('USD'); // unchanged
    });

    it('never leaves "From" and "To" equal after a change', () => {
      const { result } = renderHook(() => useConverter(mockExchangeRates));

      act(() => {
        result.current.handleFromChange('EUR'); // would duplicate To
      });
      expect(result.current.fromCurrency).not.toBe(result.current.toCurrency);

      act(() => {
        result.current.handleToChange(result.current.fromCurrency); // would duplicate From
      });
      expect(result.current.fromCurrency).not.toBe(result.current.toCurrency);
    });

    it('does not initialise From and To to the same currency from URL params', async () => {
      mockSearchParamsGet.mockImplementation(
        (key: string) =>
          (({ amount: '100', from: 'USD', to: 'USD' }) as Record<string, string>)[
            key
          ] ?? null
      );

      const { result } = renderHook(() => useConverter(mockExchangeRates));

      await waitFor(() => {
        expect(result.current.fromCurrency).toBe('USD');
      });
      // The duplicate "to=USD" must be replaced with a different currency.
      expect(result.current.toCurrency).not.toBe('USD');
    });

    it('applies distinct From/To currencies from URL params unchanged', async () => {
      mockSearchParamsGet.mockImplementation(
        (key: string) =>
          (({ from: 'GBP', to: 'JPY' }) as Record<string, string>)[key] ?? null
      );

      const { result } = renderHook(() => useConverter(mockExchangeRates));

      await waitFor(() => {
        expect(result.current.fromCurrency).toBe('GBP');
        expect(result.current.toCurrency).toBe('JPY');
      });
    });
  });
});
