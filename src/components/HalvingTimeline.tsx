import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { halvingSchedule } from '../data/supplyData';
import { Clock, Layers, TrendingDown } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

export function HalvingTimeline() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section ref={ref} className="section-shell">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          kicker="05"
          kickerLabel="Halving"
          align="left"
          inView={inView}
          title={<>The <span className="gradient-text-bitcoin">halving</span> schedule</>}
          subtitle="Every ~4 years, new Bitcoin supply is cut in half. Coded into the protocol permanently."
        />

        <div className="relative pl-0 md:pl-8">
          <div className="absolute left-3 md:left-8 top-2 bottom-2 w-px bg-gradient-to-b from-bitcoin-500/60 via-bitcoin-600/40 to-transparent hidden md:block" />

          <div className="space-y-5">
            {halvingSchedule.map((halving, index) => {
              const isFuture = new Date(halving.date) > new Date();

              return (
                <motion.div
                  key={halving.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="relative md:pl-10"
                >
                  <div className={`hidden md:block absolute left-0 top-6 w-3 h-3 rounded-full border-2 ${
                    isFuture ? 'border-midnight-500 bg-midnight-900' : 'border-bitcoin-500 bg-bitcoin-500'
                  }`} />

                  <div className={`glass-card p-5 sm:p-6 ${isFuture ? 'border-dashed border-midnight-600/40' : ''}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-midnight-400">
                        <Clock className="w-4 h-4" strokeWidth={1.75} />
                        {halving.date}{isFuture ? ' (est.)' : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-bitcoin-400" strokeWidth={1.75} />
                        <span className="text-lg font-bold text-bitcoin-400">{halving.blockReward} BTC/block</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-midnight-300">
                      <TrendingDown className="w-4 h-4 text-midnight-500" strokeWidth={1.75} />
                      {halving.totalSupplyAtHalving.toLocaleString()} BTC mined
                      <span className="text-midnight-500">({halving.inflationRate}% annual)</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
