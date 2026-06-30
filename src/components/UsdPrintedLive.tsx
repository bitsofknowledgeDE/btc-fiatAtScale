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
      className={`flex-shrink-0 flex items-center justify-center rounded-md bg-fiat-500/15 border border-fiat-500/30 ${
        compact ? 'w-5 h-5' : 'w-7 h-7 rounded-lg'
      }`}
      title={`$${((index + 1) * btcPriceUsd).toLocaleString()} printed`}
    >
      <DollarSign className={compact ? 'w-2.5 h-2.5 text-fiat-400' : 'w-3.5 h-3.5 text-fiat-400'} strokeWidth={1.75} />
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
    ? 'font-mono font-bold text-fiat-300 text-sm sm:text-base tabular-nums'
    : 'text-lg sm:text-xl font-mono font-bold text-fiat-300 tabular-nums';

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
        <span className={`${amountClass} text-fiat-300/30`}>${formatUsd(usdPrintedSinceLoad)}</span>
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
        className="w-full px-2.5 py-2 rounded-xl bg-fiat-500/10 border border-fiat-500/20"
      >
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <TrendingUp className="w-3.5 h-3.5 text-fiat-400 shrink-0" strokeWidth={1.75} />
            <span className="text-xs text-fiat-400/90 shrink-0">USD printed</span>
          </div>
          <AmountValue />
        </div>

        <div className="relative h-1 rounded-full overflow-hidden bg-midnight-800/60 mb-1.5">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fiat-700 via-fiat-500 to-fiat-300"
            style={{ width: `${usdBarProgress}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] sm:text-xs text-midnight-500 truncate">
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
              <span className="text-[10px] text-fiat-400 font-mono self-center px-0.5">
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
          <TrendingUp className="w-4 h-4 text-fiat-400" strokeWidth={1.75} />
          <span className="text-sm font-semibold text-fiat-300">USD printed</span>
        </div>
        <AmountValue />
      </div>
      <div className="relative h-2 rounded-full overflow-hidden bg-midnight-800/60">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fiat-700 via-fiat-500 to-fiat-300"
          style={{ width: `${usdBarProgress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
      <p className="text-xs text-midnight-500 mt-1.5">
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
            <span className="text-xs text-fiat-400 font-mono self-center px-1">+{usdBtcEquiv - maxBundles}</span>
          )}
        </div>
      )}
    </div>
  );
}
