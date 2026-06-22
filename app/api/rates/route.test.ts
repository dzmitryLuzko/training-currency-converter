/**
 * @jest-environment node
 */
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock fetch globally
global.fetch = jest.fn();

describe('GET /api/rates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should return exchange rates successfully', async () => {
    const mockApiResponse = {
      base: 'USD',
      rates: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 149.5,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('base');
    expect(data.data).toHaveProperty('rates');
    expect(data.data).toHaveProperty('timestamp');
    expect(data.data.rates).toHaveProperty('USD', 1); // USD should be added
    expect(data.data.rates).toHaveProperty('EUR', 0.85);
  });

  it('should include cache control headers', async () => {
    const mockApiResponse = {
      base: 'USD',
      rates: { EUR: 0.85 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);

    const cacheControl = response.headers.get('Cache-Control');
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('s-maxage=3600');
  });

  it('should handle API failures with fallback to mock data', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.rates).toHaveProperty('USD');
    expect(data.data.rates).toHaveProperty('EUR');
    // Should have fallback mock data
    expect(Object.keys(data.data.rates).length).toBeGreaterThan(0);
  });

  it('should handle HTTP errors from external API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();

    // Should fallback to mock data
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.rates).toBeDefined();
  });

  it('should include timestamp in response', async () => {
    const mockApiResponse = {
      base: 'USD',
      rates: { EUR: 0.85 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const beforeTimestamp = Date.now();
    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();
    const afterTimestamp = Date.now();

    expect(data.data.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
    expect(data.data.timestamp).toBeLessThanOrEqual(afterTimestamp);
  });

  it('should add USD rate if not present in API response', async () => {
    const mockApiResponse = {
      base: 'USD',
      rates: {
        EUR: 0.85,
        GBP: 0.73,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();

    expect(data.data.rates.USD).toBe(1);
  });

  it('should handle timeout gracefully', async () => {
    // Mock a response that times out by rejecting with abort error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('The operation was aborted')
    );

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();

    // Should fallback to mock data after timeout
    expect(data.success).toBe(true);
    expect(data.data.rates).toBeDefined();
  }, 10000);

  it('should include major currencies in fallback data', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();

    const rates = data.data.rates;
    expect(rates).toHaveProperty('USD');
    expect(rates).toHaveProperty('EUR');
    expect(rates).toHaveProperty('GBP');
    expect(rates).toHaveProperty('JPY');
    expect(rates).toHaveProperty('AUD');
    expect(rates).toHaveProperty('CAD');
  });

  it('should set correct response structure', async () => {
    const mockApiResponse = {
      base: 'USD',
      rates: { EUR: 0.85 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/rates');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('base');
    expect(data.data).toHaveProperty('rates');
    expect(data.data).toHaveProperty('timestamp');
  });
});
