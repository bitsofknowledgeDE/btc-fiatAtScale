import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { DollarSign, Bitcoin, Printer, Lock, TrendingUp, Shield } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

import { truflationAverageSince } from '../data/truflationInflation';

const avgTruflationSince2020 = truflationAverageSince(2020);

const comparisons = [
  {
    category: 'Supply control',
    usd: { icon: Printer, label: 'Central banks can print unlimited amounts', value: 'Unlimited' },
    btc: { icon: Lock, label: 'Hardcoded cap in protocol', value: '21,000,000' },
  },
  {
    category: 'Inflation model',
    usd: {
      icon: TrendingUp,
      label: 'Truflation CPI — independent daily index',
      value: `~${avgTruflationSince2020.toFixed(1)}% avg/yr since 2020`,
    },
    btc: { icon: Shield, label: 'Predictable halving every 4 years', value: '0.85%/yr' },
  },
  {
    category: 'Since 2020',
    usd: { icon: DollarSign, label: 'Created $5+ trillion in stimulus', value: '+26%' },
    btc: { icon: Bitcoin, label: 'Mined per schedule, no exceptions', value: '+7.7%' },
  },
  {
    category: 'Year 2050',
    usd: { icon: DollarSign, label: 'Exponential growth continues', value: '$85T M2' },
    btc: { icon: Bitcoin, label: 'Approaches final supply', value: '~21M BTC' },
  },
];

export function ComparisonTable() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section ref={ref} className="section-shell">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          kicker="07"
          kickerLabel="Comparison"
          align="center"
          inView={inView}
          title={<>Side by <span className="text-midnight-200">side</span></>}
          subtitle="Two monetary systems with fundamentally different approaches to value."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparisons.map((comp, index) => (
            <motion.article
              key={comp.category}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass-card p-5 sm:p-6 flex flex-col gap-4"
            >
              <h3 className="text-base font-semibold text-midnight-200">{comp.category}</h3>

              <div className="compare-cell bg-fiat-900/15 border-fiat-800/30 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-fiat-500/10 flex items-center justify-center">
                  <comp.usd.icon className="w-5 h-5 text-fiat-400" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-fiat-400 font-mono">{comp.usd.value}</p>
                  <p className="text-xs text-midnight-400 mt-0.5">{comp.usd.label}</p>
                </div>
              </div>

              <div className="compare-cell bg-bitcoin-900/15 border-bitcoin-800/30 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-bitcoin-500/10 flex items-center justify-center">
                  <comp.btc.icon className="w-5 h-5 text-bitcoin-400" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-bitcoin-400 font-mono">{comp.btc.value}</p>
                  <p className="text-xs text-midnight-400 mt-0.5">{comp.btc.label}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
