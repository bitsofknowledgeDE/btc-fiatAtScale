import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';
import { USD_PRINTED_PER_SECOND } from '../data/supplyData';
import { useLiveRace } from '../context/LiveRaceContext';

function DollarBtcBundle({
  index,
  btcPriceUsd,
  compact,
}: {
  index: number;
  btcPriceUsd: number;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`flex flex-shrink-0 items-center justify-center rounded-md border border-emerald-600/30 bg-emerald-600/10 ${
        compact ? 'w-5 h-5' : 'w-7 h-7 rounded-lg'
      }`}
      title={`$${((index + 1) * btcPriceUsd).toLocaleString()} printed`}
    >
      <DollarSign className={compact ? 'h-2.5 w-2.5 text-emerald-700' : 'h-3.5 w-3.5 text-emerald-700'} strokeWidth={1.75} />
    </motion.div>
  );
}

interface UsdPrintedLiveProps {
  variant: 'hero' | 'nav';
  /** When true, the amount uses layoutId for hero → navbar morph */
  morphAmount?: boolean;
  /** When true, show a dimmed placeholder instead of morphing amount */
  ghostAmount?: boolean;
}

export function UsdPrintedLive({ variant, morphAmount, ghostAmount }: UsdPrintedLiveProps) {
  const { usdPrintedSinceLoad, usdBtcEquiv, usdBarProgress, formatUsd, btcPriceUsd } = useLiveRace();
  const isNav = variant === 'nav';
  const maxBundles = isNav ? 20 : 24;

  const amountClass = isNav
    ? 'font-mono font-bold text-emerald-700 text-sm sm:text-base tabular-nums'
    : 'text-lg sm:text-xl font-mono font-bold text-emerald-700 tabular-nums';

  const AmountValue = () => (
    <>
      {morphAmount && (
        <motion.span
          layoutId="usd-printed-counter"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className={amountClass}
        >
          ${formatUsd(usdPrintedSinceLoad)}
        </motion.span>
      )}
      {ghostAmount && (
        <span className={`${amountClass} opacity-30`}>${formatUsd(usdPrintedSinceLoad)}</span>
      )}
      {!morphAmount && !ghostAmount && (
        <span className={amountClass}>${formatUsd(usdPrintedSinceLoad)}</span>
      )}
    </>
  );

  if (isNav) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-xl border border-emerald-600/20 bg-emerald-50 px-2.5 py-2"
      >
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-700" strokeWidth={1.75} />
            <span className="shrink-0 text-xs text-emerald-700">USD printed</span>
          </div>
          <AmountValue />
        </div>

        <div className="relative mb-1.5 h-1 overflow-hidden rounded-full bg-emerald-100">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-emerald-600"
            style={{ width: `${usdBarProgress}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[10px] text-bok-muted sm:text-xs">
            +${USD_PRINTED_PER_SECOND.toLocaleString()}/s · 1 BTC ${btcPriceUsd.toLocaleString()}
          </p>
        </div>

        {usdBtcEquiv > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1.5">
            <AnimatePresence>
              {Array.from({ length: Math.min(usdBtcEquiv, maxBundles) }).map((_, i) => (
                <DollarBtcBundle key={i} index={i} btcPriceUsd={btcPriceUsd} compact />
              ))}
            </AnimatePresence>
            {usdBtcEquiv > maxBundles && (
              <span className="self-center px-0.5 font-mono text-[10px] text-emerald-700">
                +{usdBtcEquiv - maxBundles}
              </span>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
          <span className="text-sm font-semibold text-emerald-700">USD printed</span>
        </div>
        <AmountValue />
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-emerald-100">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-600"
          style={{ width: `${usdBarProgress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
      <p className="mt-1.5 text-xs text-bok-muted">
        +${USD_PRINTED_PER_SECOND.toLocaleString()}/sec toward 1 BTC (${btcPriceUsd.toLocaleString()})
      </p>
      {usdBtcEquiv > 0 && !ghostAmount && (
        <div className="mt-3 flex flex-wrap gap-1">
          <AnimatePresence>
            {Array.from({ length: Math.min(usdBtcEquiv, maxBundles) }).map((_, i) => (
              <DollarBtcBundle key={i} index={i} btcPriceUsd={btcPriceUsd} />
            ))}
          </AnimatePresence>
          {usdBtcEquiv > maxBundles && (
            <span className="self-center px-1 font-mono text-xs text-emerald-700">+{usdBtcEquiv - maxBundles}</span>
          )}
        </div>
      )}
    </div>
  );
}
