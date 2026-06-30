import { TRUFLATION_FALLBACK_CURRENT_YOY } from '../data/truflationInflation';

export interface TruflationLiveResponse {
  rate: number;
  date: string;
  source: 'truflation-api' | 'fallback';
}

export async function fetchTruflationInflation(): Promise<TruflationLiveResponse> {
  const apiKey = import.meta.env.VITE_TRUFULATION_API_KEY;

  if (!apiKey) {
    return {
      rate: TRUFLATION_FALLBACK_CURRENT_YOY,
      date: new Date().toISOString().slice(0, 10),
      source: 'fallback',
    };
  }

  const response = await fetch(
    'https://api.truflation.com/api/v1/feed/truflation/dashboard-data-us-frozen',
    {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Truflation request failed (${response.status})`);
  }

  const data = (await response.json()) as { value: string; date?: string };
  const rate = Number.parseFloat(data.value);

  if (!Number.isFinite(rate)) {
    throw new Error('Invalid Truflation inflation payload');
  }

  return {
    rate,
    date: data.date ?? new Date().toISOString().slice(0, 10),
    source: 'truflation-api',
  };
}
