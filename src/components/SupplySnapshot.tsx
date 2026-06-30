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
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-fiat-600 to-fiat-400" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-fiat-400" strokeWidth={1.75} />
                <span className="text-sm font-medium text-fiat-300">Total USD M2</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-midnight-50 tracking-tight">
                ${Math.floor(liveUSD).toLocaleString('en-US')}
              </p>
              <p className="text-sm text-midnight-500 mt-2">
                Growing +${USD_PRINTED_PER_SECOND.toLocaleString()}/sec
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-mono font-bold text-fiat-400/80">∞</p>
              <p className="text-xs text-midnight-500 mt-1">No cap</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-bitcoin-600 to-bitcoin-400" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-bitcoin-400" strokeWidth={1.75} />
                <span className="text-sm font-medium text-bitcoin-300">Bitcoin supply</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-midnight-50 tracking-tight">
                {circulatingSupply.toLocaleString()} BTC
              </p>
              <p className="text-sm text-midnight-500 mt-2">
                {minedPct.toFixed(2)}% of 21M cap mined
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-2xl font-mono font-bold text-bitcoin-400">{minedPct.toFixed(0)}%</span>
              <div className="w-16 h-1 rounded-full bg-midnight-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-bitcoin-600 to-bitcoin-400"
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
