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
          <div className="absolute bottom-2 left-3 top-2 hidden w-px bg-gradient-to-b from-bitcoin-orange/60 to-transparent md:left-8 md:block" />

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
                    isFuture ? 'border-bok-muted bg-white' : 'border-bitcoin-orange bg-bitcoin-orange'
                  }`} />

                  <div className={`glass-card p-5 sm:p-6 ${isFuture ? 'border-dashed border-bok-muted/50' : ''}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-bok-muted">
                        <Clock className="w-4 h-4" strokeWidth={1.75} />
                        {halving.date}{isFuture ? ' (est.)' : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-bitcoin-orange" strokeWidth={1.75} />
                        <span className="text-lg font-bold text-bitcoin-orange">{halving.blockReward} BTC/block</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-bok-text">
                      <TrendingDown className="h-4 w-4 text-bok-muted" strokeWidth={1.75} />
                      {halving.totalSupplyAtHalving.toLocaleString()} BTC mined
                      <span className="text-bok-muted">({halving.inflationRate}% annual)</span>
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
