import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TrendingUp, Coins } from 'lucide-react';
import { useLiveCounter } from '../hooks/useCountUp';
import { CURRENT_USD_M2, USD_PRINTED_PER_SECOND } from '../data/supplyData';
import { useBtcNetwork } from '../context/BtcNetworkContext';

export function SupplySnapshot() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const { circulatingSupply, minedPct } = useBtcNetwork();
  const liveUSD = useLiveCounter(CURRENT_USD_M2, USD_PRINTED_PER_SECOND);

  return (
    <section ref={ref} className="px-4 pb-8 -mt-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 h-0.5 w-full bg-emerald-600" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
                <span className="text-sm font-medium text-emerald-700">Total USD M2</span>
              </div>
              <p className="font-mono text-2xl font-bold tracking-tight text-bok-text sm:text-3xl">
                ${Math.floor(liveUSD).toLocaleString('en-US')}
              </p>
              <p className="mt-2 text-sm text-bok-muted">
                Growing +${USD_PRINTED_PER_SECOND.toLocaleString()}/sec
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-bold text-emerald-700">∞</p>
              <p className="mt-1 text-xs text-bok-muted">No cap</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 h-0.5 w-full bg-bitcoin-orange" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-bitcoin-orange" strokeWidth={1.75} />
                <span className="text-sm font-medium text-bitcoin-orange">Bitcoin supply</span>
              </div>
              <p className="font-mono text-2xl font-bold tracking-tight text-bok-text sm:text-3xl">
                {circulatingSupply.toLocaleString()} BTC
              </p>
              <p className="mt-2 text-sm text-bok-muted">
                {minedPct.toFixed(2)}% of 21M cap mined
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-2xl font-bold text-bitcoin-orange">{minedPct.toFixed(0)}%</span>
              <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                  className="h-full rounded-full bg-bitcoin-orange"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${minedPct}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
