import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { USD_PRINTED_PER_SECOND } from '../data/supplyData';
import { useBtcPrice } from './BtcPriceContext';
import { useBtcNetworkEmission } from './BtcNetworkContext';
/** Navbar height + top padding — counter sticks once live panel clears this line */
const NAV_STICKY_OFFSET_PX = 96;

export interface LiveRaceState {
  elapsed: number;
  usdPrintedSinceLoad: number;
  usdBtcEquiv: number;
  usdBarProgress: number;
  btcMined: number;
  btcWhole: number;
  btcBarProgress: number;
  ratio: number;
  btcPriceUsd: number;
  /** True only when the price service answered — gates every price-derived
   *  figure so a stale fallback is never shown as a live price. */
  priceAvailable: boolean;
  navCounterVisible: boolean;
  counterAnchorRef: (node: HTMLDivElement | null) => void;
  formatUsd: (num: number) => string;
}

const LiveRaceContext = createContext<LiveRaceState | null>(null);

export function LiveRaceProvider({ children }: { children: ReactNode }) {
  const { btcPriceUsd, isLivePrice } = useBtcPrice();
  const { satsPerSecond } = useBtcNetworkEmission();
  const btcPriceRef = useRef(btcPriceUsd);
  btcPriceRef.current = btcPriceUsd;
  const satsPerSecondRef = useRef(satsPerSecond);
  satsPerSecondRef.current = satsPerSecond;

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [anchorMounted, setAnchorMounted] = useState(false);
  const [navCounterVisible, setNavCounterVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [usdBtcEquiv, setUsdBtcEquiv] = useState(0);
  const [usdBarProgress, setUsdBarProgress] = useState(0);
  const [btcWhole, setBtcWhole] = useState(0);
  const [btcBarProgress, setBtcBarProgress] = useState(0);
  const [btcMined, setBtcMined] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const secs = (Date.now() - start) / 1000;
      const price = btcPriceRef.current;
      setElapsed(Math.floor(secs));

      const totalUsdPrinted = secs * USD_PRINTED_PER_SECOND;
      const btcEquivCompleted = Math.floor(totalUsdPrinted / price);
      const usdRemainder = totalUsdPrinted - btcEquivCompleted * price;
      setUsdBtcEquiv(btcEquivCompleted);
      setUsdBarProgress((usdRemainder / price) * 100);

      const totalBtcMined = secs * (satsPerSecondRef.current / 100_000_000);
      const wholeBtc = Math.floor(totalBtcMined);
      const btcRemainder = totalBtcMined - wholeBtc;
      setBtcWhole(wholeBtc);
      setBtcBarProgress(btcRemainder * 100);
      setBtcMined(totalBtcMined);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const counterAnchorRef = useCallback((node: HTMLDivElement | null) => {
    anchorRef.current = node;
    setAnchorMounted(Boolean(node));
  }, []);

  useEffect(() => {
    const node = anchorRef.current;
    if (!anchorMounted || !node) return;

    const updateStickyCounter = () => {
      const { bottom } = node.getBoundingClientRect();
      setNavCounterVisible(bottom < NAV_STICKY_OFFSET_PX);
    };

    updateStickyCounter();
    window.addEventListener('scroll', updateStickyCounter, { passive: true });
    window.addEventListener('resize', updateStickyCounter);

    const resizeObserver = new ResizeObserver(updateStickyCounter);
    resizeObserver.observe(node);

    return () => {
      window.removeEventListener('scroll', updateStickyCounter);
      window.removeEventListener('resize', updateStickyCounter);
      resizeObserver.disconnect();
    };
  }, [anchorMounted]);

  const usdPrintedSinceLoad = elapsed * USD_PRINTED_PER_SECOND;
  const ratio = usdBtcEquiv > 0 && btcMined > 0 ? Math.round(usdBtcEquiv / btcMined) : 0;
  const formatUsd = (num: number) => Math.floor(num).toLocaleString('en-US');

  return (
    <LiveRaceContext.Provider
      value={{
        elapsed,
        usdPrintedSinceLoad,
        usdBtcEquiv,
        usdBarProgress,
        btcMined,
        btcWhole,
        btcBarProgress,
        ratio,
        btcPriceUsd,
        priceAvailable: isLivePrice,
        navCounterVisible,
        counterAnchorRef,
        formatUsd,
      }}
    >
      {children}
    </LiveRaceContext.Provider>
  );
}

export function useLiveRace() {
  const ctx = useContext(LiveRaceContext);
  if (!ctx) throw new Error('useLiveRace must be used within LiveRaceProvider');
  return ctx;
}
