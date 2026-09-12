import { DollarSign, TrendingUp } from 'lucide-react';
import { USD_PRINTED_PER_SECOND } from '../data/supplyData';
import { useLiveRace } from '../context/LiveRaceContext';

/** One chip per whole bitcoin the printed dollars would buy. */
function DollarBtcChip({ index, btcPriceUsd }: { index: number; btcPriceUsd: number }) {
  return (
    <span
      className="pop-in flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-series-3/30 bg-series-3/10"
      title={`$${((index + 1) * btcPriceUsd).toLocaleString('en-US')} printed`}
    >
      <DollarSign className="h-2.5 w-2.5 text-series-3" strokeWidth={1.75} />
    </span>
  );
}

const MAX_CHIPS = 20;

/**
 * The compact live counter that rides in the header once the cockpit counter
 * has scrolled away. No motion library — the appearance is a CSS transition on
 * the wrapper in Layout.tsx (WP-2.4).
 */
export function UsdPrintedLive() {
  const { usdPrintedSinceLoad, usdBtcEquiv, usdBarProgress, formatUsd, btcPriceUsd, priceAvailable } =
    useLiveRace();

  return (
    <div className="w-full rounded-xl border border-series-3/20 bg-series-3/5 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-series-3" strokeWidth={1.75} />
          <span className="shrink-0 text-xs text-series-3">USD printed</span>
        </span>
        <span className="text-sm font-bold tabular-nums text-series-3 sm:text-base">
          ${formatUsd(usdPrintedSinceLoad)}
        </span>
      </div>

      <div className="relative mb-1.5 h-1 overflow-hidden rounded-full bg-series-3/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-series-3"
          style={{ width: `${usdBarProgress}%` }}
        />
      </div>

      <p className="truncate text-[10px] tabular-nums text-bok-muted sm:text-xs">
        +${USD_PRINTED_PER_SECOND.toLocaleString('en-US')}/s
        {priceAvailable && ` · 1 BTC $${Math.round(btcPriceUsd).toLocaleString('en-US')}`}
      </p>

      {priceAvailable && usdBtcEquiv > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-0.5">
          {Array.from({ length: Math.min(usdBtcEquiv, MAX_CHIPS) }).map((_, i) => (
            <DollarBtcChip key={i} index={i} btcPriceUsd={btcPriceUsd} />
          ))}
          {usdBtcEquiv > MAX_CHIPS && (
            <span className="self-center px-0.5 text-[10px] tabular-nums text-series-3">
              +{(usdBtcEquiv - MAX_CHIPS).toLocaleString('en-US')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default UsdPrintedLive;
