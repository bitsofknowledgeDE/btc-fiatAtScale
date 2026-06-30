import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import {
  BITCOIN_MAX_SUPPLY,
  BTC_MINED_PER_BLOCK,
  computeBtcEmissionRates,
  FALLBACK_BTC_EMISSION,
  FALLBACK_CIRCULATING_SUPPLY,
  type BtcEmissionRates,
} from '../data/supplyData';

interface BtcNetworkState {
  circulatingSupply: number;
  blockReward: number;
  emission: BtcEmissionRates;
  minedPct: number;
  loading: boolean;
  fromSupabase: boolean;
}

const BtcNetworkContext = createContext<BtcNetworkState | null>(null);

export function BtcNetworkProvider({ children }: { children: ReactNode }) {
  const [circulatingSupply, setCirculatingSupply] = useState(FALLBACK_CIRCULATING_SUPPLY);
  const [blockReward, setBlockReward] = useState(BTC_MINED_PER_BLOCK);
  const [loading, setLoading] = useState(true);
  const [fromSupabase, setFromSupabase] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('global_price_data')
          .select('circulating_supply, block_reward')
          .eq('symbol', 'BTC')
          .maybeSingle();

        if (error) throw error;
        if (!data?.circulating_supply || !data?.block_reward) {
          throw new Error('Missing BTC network fields');
        }

        const supply = Number(data.circulating_supply);
        const reward = Number(data.block_reward);
        if (!Number.isFinite(supply) || supply <= 0 || !Number.isFinite(reward) || reward <= 0) {
          throw new Error('Invalid BTC network payload');
        }

        if (cancelled) return;
        setCirculatingSupply(Math.round(supply));
        setBlockReward(reward);
        setFromSupabase(true);
      } catch (error) {
        console.error('Error fetching BTC network data:', error);
        if (!cancelled) {
          setCirculatingSupply(FALLBACK_CIRCULATING_SUPPLY);
          setBlockReward(BTC_MINED_PER_BLOCK);
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

  const emission = useMemo(() => computeBtcEmissionRates(blockReward), [blockReward]);
  const minedPct = (circulatingSupply / BITCOIN_MAX_SUPPLY) * 100;

  return (
    <BtcNetworkContext.Provider
      value={{
        circulatingSupply,
        blockReward,
        emission,
        minedPct,
        loading,
        fromSupabase,
      }}
    >
      {children}
    </BtcNetworkContext.Provider>
  );
}

export function useBtcNetwork() {
  const ctx = useContext(BtcNetworkContext);
  if (!ctx) throw new Error('useBtcNetwork must be used within BtcNetworkProvider');
  return ctx;
}

/** Sats/sec before network fetch completes. */
export function useBtcNetworkEmission(): BtcEmissionRates {
  const ctx = useContext(BtcNetworkContext);
  return ctx?.emission ?? FALLBACK_BTC_EMISSION;
}
