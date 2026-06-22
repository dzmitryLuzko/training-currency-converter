import { NextRequest, NextResponse } from 'next/server';

/**
 * Normalised shape every source is mapped onto before it leaves this module.
 */
interface NormalisedRates {
  base: string;
  rates: Record<string, number>;
}

interface RateSource {
  name: string;
  url: string;
  transform: (data: any) => NormalisedRates;
}

/**
 * Exchange-rate providers, tried in order. All are USD-based and free; some
 * may require a key or be rate-limited, so the chain falls through on any
 * failure and ultimately lands on MOCK_RATES, keeping the app working with no
 * configuration. USD is injected when a provider omits its own base currency.
 */
const API_SOURCES: RateSource[] = [
  {
    name: 'exchangerate.host',
    url: 'https://api.exchangerate.host/latest?base=USD',
    transform: (data) => ({
      base: data.base ?? 'USD',
      rates: { USD: 1, ...(data.rates ?? {}) },
    }),
  },
  {
    name: 'exchangerate-api.com',
    url: 'https://api.exchangerate-api.com/v4/latest/USD',
    transform: (data) => ({
      base: data.base ?? 'USD',
      rates: { USD: 1, ...(data.rates ?? {}) },
    }),
  },
  {
    name: 'open.er-api.com',
    url: 'https://open.er-api.com/v6/latest/USD',
    transform: (data) => ({
      base: data.base_code ?? data.base ?? 'USD',
      rates: { USD: 1, ...(data.rates ?? {}) },
    }),
  },
];

/**
 * Mock rates used only when every live source is unreachable. Covers all 10
 * supported currencies so the converter still functions offline.
 */
const MOCK_RATES: NormalisedRates = {
  base: 'USD',
  rates: {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 149.5,
    AUD: 1.52,
    CAD: 1.35,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
    MXN: 17.25,
  },
};

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Fetch and normalise rates from a single source, aborting slow connections.
 * A browser-like User-Agent and the platform's default fetch keep us clear of
 * the SSL/agent quirks that some providers exhibit under Node.
 */
async function fetchFromSource(source: RateSource): Promise<NormalisedRates> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const normalised = source.transform(data);

    // Guard against "soft failures": some providers answer 200 OK with an
    // error payload and no rates (e.g. a key is now required). Treat a result
    // that carries nothing beyond the injected USD as a failure so the chain
    // falls through to the next source.
    if (Object.keys(normalised.rates).length <= 1) {
      throw new Error('Response contained no usable rates');
    }

    return normalised;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Try each source in turn; degrade gracefully to mock data if all fail.
 */
async function fetchExchangeRates(): Promise<NormalisedRates> {
  for (const source of API_SOURCES) {
    try {
      return await fetchFromSource(source);
    } catch (error: any) {
      console.error(`Rate source "${source.name}" failed:`, error?.message);
    }
  }

  console.warn('All rate sources failed — serving mock rates.');
  return MOCK_RATES;
}

/**
 * GET /api/rates — returns USD-based exchange rates, cached for one hour.
 */
export async function GET(_request: NextRequest) {
  try {
    const { base, rates } = await fetchExchangeRates();

    return NextResponse.json(
      {
        success: true,
        data: { base, rates, timestamp: Date.now() },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error: any) {
    console.error('Unexpected error in /api/rates:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch exchange rates',
      },
      { status: 500 }
    );
  }
}

// Revalidate the cached response every hour.
export const revalidate = 3600;
