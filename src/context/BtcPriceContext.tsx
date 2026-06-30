import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { FALLBACK_BTC_PRICE_USD, fetchBitcoinPrice } from '../lib/bitcoin-price';

interface BtcPriceState {
  btcPriceUsd: number;
  priceSource: string | null;
  isLivePrice: boolean;
  loading: boolean;
}

const BtcPriceContext = createContext<BtcPriceState | null>(null);

export function BtcPriceProvider({ children }: { children: ReactNode }) {
  const [btcPriceUsd, setBtcPriceUsd] = useState(FALLBACK_BTC_PRICE_USD);
  const [priceSource, setPriceSource] = useState<string | null>(null);
  const [isLivePrice, setIsLivePrice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

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
  }, []);

  return (
    <BtcPriceContext.Provider value={{ btcPriceUsd, priceSource, isLivePrice, loading }}>
      {children}
    </BtcPriceContext.Provider>
  );
}

export function useBtcPrice() {
  const ctx = useContext(BtcPriceContext);
  if (!ctx) throw new Error('useBtcPrice must be used within BtcPriceProvider');
  return ctx;
}
