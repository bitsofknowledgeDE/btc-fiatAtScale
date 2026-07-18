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
          title={<>Side by <span className="text-bok-text">side</span></>}
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
              <h3 className="text-base font-semibold text-bok-text">{comp.category}</h3>

              <div className="compare-cell flex items-center gap-4 border-emerald-200 bg-emerald-50">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600/10">
                  <comp.usd.icon className="h-5 w-5 text-emerald-700" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold text-emerald-700">{comp.usd.value}</p>
                  <p className="mt-0.5 text-xs text-bok-muted">{comp.usd.label}</p>
                </div>
              </div>

              <div className="compare-cell flex items-center gap-4 border-orange-200 bg-orange-50">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-bitcoin-orange/10">
                  <comp.btc.icon className="h-5 w-5 text-bitcoin-orange" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold text-bitcoin-orange">{comp.btc.value}</p>
                  <p className="mt-0.5 text-xs text-bok-muted">{comp.btc.label}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
