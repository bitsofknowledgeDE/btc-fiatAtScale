import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { FALLBACK_BTC_PRICE_USD, fetchBitcoinPrice } from '../lib/bitcoin-price';

interface BtcPriceState {
  /** Never render this as a live price unless `isLivePrice` is true. */
  btcPriceUsd: number;
  priceSource: string | null;
  isLivePrice: boolean;
  loading: boolean;
  refetch: () => void;
}

const BtcPriceContext = createContext<BtcPriceState | null>(null);

export function BtcPriceProvider({ children }: { children: ReactNode }) {
  const [btcPriceUsd, setBtcPriceUsd] = useState(FALLBACK_BTC_PRICE_USD);
  const [priceSource, setPriceSource] = useState<string | null>(null);
  const [isLivePrice, setIsLivePrice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const data = await fetchBitcoinPrice();
        if (cancelled) return;
        setBtcPriceUsd(data.price);
        setPriceSource(data.source ?? 'supabase');
        setIsLivePrice(true);
      } catch {
        if (cancelled) return;
        setBtcPriceUsd(FALLBACK_BTC_PRICE_USD);
        setPriceSource(null);
        setIsLivePrice(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <BtcPriceContext.Provider
      value={{ btcPriceUsd, priceSource, isLivePrice, loading, refetch }}
    >
      {children}
    </BtcPriceContext.Provider>
  );
}

export function useBtcPrice() {
  const ctx = useContext(BtcPriceContext);
  if (!ctx) throw new Error('useBtcPrice must be used within BtcPriceProvider');
  return ctx;
}
