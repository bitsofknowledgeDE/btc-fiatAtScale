import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

export interface BitcoinYearlyPrice {
  year: number;
  bitcoinPriceUsd: number;
}

/**
 * Yearly BTC closes from `global_bitcoin_historical_data`.
 *
 * There is deliberately NO baked-in fallback series: the old one ended in a
 * hard-coded "2025: 105000" that the chart drew right next to the current year,
 * so a dead data source looked like live data (decision 2026-09-08 — on API
 * failure show a notice, never a stale number). On failure the hook returns an
 * empty series plus `error`, and the caller renders `BokDataNotice` and drops
 * the price series from the chart.
 */
export function useBitcoinHistoricalPrices() {
  const [prices, setPrices] = useState<BitcoinYearlyPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(!supabaseConfigured);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('global_bitcoin_historical_data')
          .select('year, bitcoin_price')
          .gte('year', 2010)
          .order('year', { ascending: true });

        if (queryError) throw queryError;
        if (!data?.length) throw new Error('No bitcoin historical rows');
        if (cancelled) return;

        setPrices(
          data
            .map((row) => ({
              year: Number(row.year),
              bitcoinPriceUsd: Number(row.bitcoin_price),
            }))
            .filter((p) => Number.isFinite(p.year) && Number.isFinite(p.bitcoinPriceUsd)),
        );
        setError(false);
      } catch (err) {
        console.error('Error fetching bitcoin historical prices:', err);
        if (!cancelled) {
          setPrices([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const priceByYear = useMemo(
    () => new Map(prices.map((p) => [p.year, p.bitcoinPriceUsd])),
    [prices],
  );

  return { prices, priceByYear, loading, error, refetch };
}

export function formatBtcPriceUsd(value: number): string {
  if (value >= 1000) return `$${Math.round(value).toLocaleString('en-US')}`;
  return `$${value.toFixed(2)}`;
}
