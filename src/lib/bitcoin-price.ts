export const FALLBACK_BTC_PRICE_USD = 103_000;

export interface BitcoinPriceResponse {
  price: number;
  source?: string;
  change24h?: number;
}

export async function fetchBitcoinPrice(): Promise<BitcoinPriceResponse> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }

  const response = await fetch(`${url}/functions/v1/bitcoin-price`, {
    headers: {
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Bitcoin price request failed (${response.status})`);
  }

  const data = (await response.json()) as BitcoinPriceResponse;
  if (!data.price || data.price <= 0) {
    throw new Error('Invalid bitcoin price payload');
  }

  return data;
}
