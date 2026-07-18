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
      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-bitcoin-orange/30 bg-bitcoin-orange/10"
      title={`${index + 1} BTC mined`}
    >
      <Bitcoin className="h-3.5 w-3.5 text-bitcoin-orange" strokeWidth={1.75} />
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
    <section className="relative flex min-h-[calc(100dvh-5rem)] items-center overflow-x-hidden px-4 py-16">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 85% 35%, rgba(247, 147, 26, 0.08), transparent 70%)',
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
            <span className="num">01</span>
            <span className="label">Live monetary divergence</span>
          </p>
          <h1 className="mb-5 font-heading text-4xl font-extrabold leading-none tracking-tighter sm:text-5xl lg:text-6xl">
            <span className="text-bok-text">fiat</span>
            <span className="text-bitcoin-orange">At</span>
            <span className="text-bok-text">Scale</span>
          </h1>
          <p className="text-base sm:text-lg text-bok-muted max-w-md leading-relaxed mb-6">
            Infinite fiat expansion meets Bitcoin's fixed 21 million cap. Watch the gap widen in real time.
          </p>
          <p className="text-[11px] text-bok-muted mb-8 sm:hidden">
            <a
              href="https://bitsofknowledge.de"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-bok-muted transition-colors hover:text-bitcoin-orange"
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
            <p className="text-sm text-bok-muted">
              Since you opened this page ({elapsed}s)
            </p>
            <span className="font-mono text-xs text-emerald-700">Live</span>
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
                <Zap className="h-4 w-4 text-bitcoin-orange" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-bitcoin-orange">BTC mined</span>
              </div>
              <span className="font-mono text-lg font-bold text-bitcoin-orange sm:text-xl">
                {btcMined.toFixed(6)}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-bitcoin-orange"
                style={{ width: `${btcBarProgress}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
            <p className="mt-1.5 text-xs text-bok-muted">
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

          <div className="border-t border-bok-border pt-4">
            <p className="text-sm text-bok-text">
              <span className="font-mono text-lg font-bold text-emerald-700">{ratio > 0 ? `${ratio}x` : '0x'}</span>
              {' '}more USD (BTC-equivalent) printed than BTC mined
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
