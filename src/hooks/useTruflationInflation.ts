import { useEffect, useState } from 'react';
import { TRUFLATION_FALLBACK_CURRENT_YOY } from '../data/truflationInflation';
import { fetchTruflationInflation } from '../lib/truflation-inflation';

export function useTruflationInflation() {
  const [currentYoY, setCurrentYoY] = useState(TRUFLATION_FALLBACK_CURRENT_YOY);
  const [asOfDate, setAsOfDate] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchTruflationInflation();
        if (cancelled) return;
        setCurrentYoY(data.rate);
        setAsOfDate(data.date);
        setIsLive(data.source === 'truflation-api');
      } catch {
        if (cancelled) return;
        setCurrentYoY(TRUFLATION_FALLBACK_CURRENT_YOY);
        setAsOfDate(null);
        setIsLive(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { currentYoY, asOfDate, isLive, loading };
}
