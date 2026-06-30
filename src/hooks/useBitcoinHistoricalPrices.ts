import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface BitcoinYearlyPrice {
  year: number;
  bitcoinPriceUsd: number;
}

/** Fallback aligned with `global_bitcoin_historical_data` seed (2010–2025). */
const FALLBACK_BTC_YEARLY: BitcoinYearlyPrice[] = [
  { year: 2010, bitcoinPriceUsd: 0.06 },
  { year: 2011, bitcoinPriceUsd: 4.72 },
  { year: 2012, bitcoinPriceUsd: 13.51 },
  { year: 2013, bitcoinPriceUsd: 805.9 },
  { year: 2014, bitcoinPriceUsd: 320.19 },
  { year: 2015, bitcoinPriceUsd: 430.05 },
  { year: 2016, bitcoinPriceUsd: 968.23 },
  { year: 2017, bitcoinPriceUsd: 14156.4 },
  { year: 2018, bitcoinPriceUsd: 3674.85 },
  { year: 2019, bitcoinPriceUsd: 7193.6 },
  { year: 2020, bitcoinPriceUsd: 28990.1 },
  { year: 2021, bitcoinPriceUsd: 46306.45 },
  { year: 2022, bitcoinPriceUsd: 16547.5 },
  { year: 2023, bitcoinPriceUsd: 42750 },
  { year: 2024, bitcoinPriceUsd: 69420 },
  { year: 2025, bitcoinPriceUsd: 105000 },
];

export function useBitcoinHistoricalPrices() {
  const [prices, setPrices] = useState<BitcoinYearlyPrice[]>(FALLBACK_BTC_YEARLY);
  const [loading, setLoading] = useState(true);
  const [fromSupabase, setFromSupabase] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('global_bitcoin_historical_data')
          .select('year, bitcoin_price')
          .gte('year', 2010)
          .order('year', { ascending: true });

        if (error) throw error;
        if (!data?.length) throw new Error('No bitcoin historical rows');

        if (cancelled) return;
        setPrices(
          data.map((row) => ({
            year: row.year,
            bitcoinPriceUsd: Number(row.bitcoin_price),
          })),
        );
        setFromSupabase(true);
      } catch (error) {
        console.error('Error fetching bitcoin historical prices:', error);
        if (!cancelled) {
          setPrices(FALLBACK_BTC_YEARLY);
          setFromSupabase(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const priceByYear = useMemo(
    () => new Map(prices.map((p) => [p.year, p.bitcoinPriceUsd])),
    [prices],
  );

  return { prices, priceByYear, loading, fromSupabase };
}

export function formatBtcPriceUsd(value: number): string {
  if (value >= 1000) return `$${Math.round(value).toLocaleString('en-US')}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(2)}`;
}
