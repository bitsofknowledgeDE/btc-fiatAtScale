import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Zap, Bitcoin } from 'lucide-react';
import { useLiveRace } from '../context/LiveRaceContext';
import { useBtcNetwork } from '../context/BtcNetworkContext';
import { UsdPrintedLive } from './UsdPrintedLive';

function BitcoinBundle({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-bitcoin-500/15 border border-bitcoin-500/30"
      title={`${index + 1} BTC mined`}
    >
      <Bitcoin className="w-3.5 h-3.5 text-bitcoin-400" strokeWidth={1.75} />
    </motion.div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { emission } = useBtcNetwork();
  const {
    elapsed,
    btcMined,
    btcWhole,
    btcBarProgress,
    ratio,
    navCounterVisible,
    counterAnchorRef,
  } = useLiveRace();

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-x-hidden px-4 pt-28 pb-12">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 15% 50%, rgba(76, 175, 80, 0.05), transparent), radial-gradient(ellipse 60% 50% at 85% 40%, rgba(247, 147, 26, 0.07), transparent)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-left"
        >
          <p className="section-kicker mb-4">
            <span className="section-kicker-num">01</span>
            <span>Live monetary divergence</span>
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-none mb-5 font-display">
            <span className="text-midnight-100">fiat</span>
            <span className="text-btc-orange">At</span>
            <span className="text-midnight-100">Scale</span>
          </h1>
          <p className="text-base sm:text-lg text-bok-muted max-w-md leading-relaxed mb-6">
            Infinite fiat expansion meets Bitcoin's fixed 21 million cap. Watch the gap widen in real time.
          </p>
          <p className="text-[11px] text-bok-muted mb-8 sm:hidden">
            <a
              href="https://bitsofknowledge.de"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-midnight-300 hover:text-btc-orange transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", letterSpacing: '0.08em' }}
            >
              A BITS OF KNOWLEDGE TOOL
            </a>
          </p>
          <div>
            <a href="#supply" className="btn-primary">
              Explore data
            </a>
          </div>
        </motion.div>

        <motion.div
          ref={counterAnchorRef}
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 sm:p-7"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-midnight-400">
              Since you opened this page ({elapsed}s)
            </p>
            <span className="text-xs font-mono text-fiat-400">Live</span>
          </div>

          <div className="mb-6">
            <UsdPrintedLive
              variant="hero"
              morphAmount={!navCounterVisible}
              ghostAmount={navCounterVisible}
            />
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-bitcoin-400" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-bitcoin-300">BTC mined</span>
              </div>
              <span className="text-lg sm:text-xl font-mono font-bold text-bitcoin-300">
                {btcMined.toFixed(6)}
              </span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden bg-midnight-800/60">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-bitcoin-700 via-bitcoin-500 to-bitcoin-300"
                style={{ width: `${btcBarProgress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
            <p className="text-xs text-midnight-500 mt-1.5">
              ~{Math.round(emission.satsPerSecond).toLocaleString()} sats/sec
            </p>
            {btcWhole > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                <AnimatePresence>
                  {Array.from({ length: Math.min(btcWhole, 12) }).map((_, i) => (
                    <BitcoinBundle key={i} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-midnight-700/40">
            <p className="text-sm text-midnight-300">
              <span className="font-mono font-bold text-fiat-400 text-lg">{ratio > 0 ? `${ratio}x` : '0x'}</span>
              {' '}more USD (BTC-equivalent) printed than BTC mined
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
