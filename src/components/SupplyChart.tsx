import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { supplyData } from '../data/supplyData';
import { SectionHeader } from './SectionHeader';

const chartData = supplyData.map(d => ({
  year: d.year,
  usd: d.usdM2Trillions,
  btc: d.year < 2009 ? null : d.btcSupplyMillions,
  projected: d.projected,
}));

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: number }) {
  if (!active || !payload) return null;
  const point = supplyData.find(d => d.year === label);
  return (
    <div className="glass-card p-4 border border-midnight-600/50">
      <p className="text-sm font-semibold text-midnight-200 mb-2">
        {label} {point?.projected ? '(Projected)' : ''}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm">
          <span className={entry.dataKey === 'usd' ? 'text-fiat-400' : 'text-bitcoin-400'}>
            {entry.dataKey === 'usd' ? `USD M2: $${entry.value.toFixed(1)}T` : `BTC: ${entry.value.toFixed(2)}M`}
          </span>
        </p>
      ))}
    </div>
  );
}

export function SupplyChart() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section ref={ref} className="section-shell">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          kicker="01"
          kickerLabel="Supply"
          align="left"
          inView={inView}
          title={
            <>
              Supply <span className="gradient-text-fiat">expansion</span> vs{' '}
              <span className="gradient-text-bitcoin">scarcity</span>
            </>
          }
          subtitle="USD M2 has grown 155% since 2009. Bitcoin caps at 21 million coins."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-fiat-500" />
              <span className="text-sm text-midnight-300">USD M2 (Trillions)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-bitcoin-500" />
              <span className="text-sm text-midnight-300">BTC Supply (Millions)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-midnight-500" />
              <span className="text-sm text-midnight-400">Projected</span>
            </div>
          </div>

          <div className="h-[360px] sm:h-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="usdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f7931a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="year" stroke="#627d98" tick={{ fill: '#829ab1', fontSize: 12 }} />
                <YAxis
                  yAxisId="usd"
                  stroke="#4caf50"
                  tick={{ fill: '#4caf50', fontSize: 12 }}
                  label={{ value: 'USD Trillions', angle: -90, position: 'insideLeft', fill: '#4caf50', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="btc"
                  orientation="right"
                  stroke="#f7931a"
                  tick={{ fill: '#f7931a', fontSize: 12 }}
                  domain={[0, 21]}
                  label={{ value: 'BTC Millions', angle: 90, position: 'insideRight', fill: '#f7931a', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine yAxisId="usd" x={2026} stroke="#486581" strokeDasharray="5 5" label={{ value: 'Now', fill: '#829ab1', fontSize: 11 }} />
                <Area yAxisId="usd" type="monotone" dataKey="usd" stroke="#4caf50" strokeWidth={2} fill="url(#usdGradient)" />
                <Area yAxisId="btc" type="monotone" dataKey="btc" stroke="#f7931a" strokeWidth={2} fill="url(#btcGradient)" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
