import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { supplyData } from '../data/supplyData';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { truflationAverageSince } from '../data/truflationInflation';
import { SectionHeader } from './SectionHeader';

const projectionData = supplyData.map(d => ({
  year: d.year,
  usd: d.usdM2Trillions,
  btc: d.btcSupplyMillions,
  projected: d.projected,
}));

const yearMin = 1960;
const yearMax = 2050;
const yearTicks = [1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2040, 2050];

function ProjectionTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: number }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-4 border border-midnight-600/50">
      <p className="text-sm font-semibold text-midnight-200 mb-2">{label}</p>
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

export function FutureProjection() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });
  const multiplier2050 = (85 / 21.7).toFixed(0);
  const avgTruflationSince2010 = truflationAverageSince(2010);

  return (
    <section ref={ref} className="section-shell bg-midnight-900/15">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          kicker="06"
          kickerLabel="Projection"
          align="left"
          inView={inView}
          title={<>Looking <span className="gradient-text-bitcoin">ahead</span></>}
          subtitle={`Historical M2 trends suggest $85T USD by 2050 (${multiplier2050}x growth). Bitcoin stays at 21M.`}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-card p-5 sm:p-8"
        >
          <p className="text-sm font-medium text-midnight-300 mb-4">USD M2 supply, 1960-2050 (trillions)</p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-fiat-500" />
              <span className="text-xs text-midnight-400">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-fiat-800 border border-fiat-600" />
              <span className="text-xs text-midnight-400">Projected</span>
            </div>
          </div>
          <div className="h-[340px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[yearMin, yearMax]}
                  ticks={yearTicks}
                  stroke="#627d98"
                  tick={{ fill: '#829ab1', fontSize: 11 }}
                  scale="linear"
                />
                <YAxis
                  stroke="#627d98"
                  tick={{ fill: '#829ab1', fontSize: 12 }}
                  label={{ value: 'USD Trillions', angle: -90, position: 'insideLeft', fill: '#829ab1', fontSize: 12 }}
                />
                <Tooltip content={<ProjectionTooltip />} />
                <ReferenceLine x={2026} stroke="#f7931a" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: 'Today', fill: '#f7931a', fontSize: 11, position: 'top' }} />
                <Bar dataKey="usd" radius={[3, 3, 0, 0]} barSize={12}>
                  {projectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.projected ? '#1b5e20' : '#4caf50'} opacity={entry.projected ? 0.75 : 1} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr] gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 }}
            className="glass-card p-6 bg-fiat-900/10"
          >
            <p className="data-metric text-fiat-400 mb-2">{multiplier2050}x</p>
            <p className="text-sm text-midnight-400">Projected USD supply growth by 2050</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.32 }}
            className="glass-card p-6"
          >
            <p className="data-metric text-bitcoin-400 mb-2">0%</p>
            <p className="text-sm text-midnight-400">BTC growth after ~2140</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.39 }}
            className="glass-card p-6"
          >
            <p className="data-metric text-midnight-100 mb-2">{avgTruflationSince2010.toFixed(1)}%</p>
            <p className="text-sm text-midnight-400">Avg. Truflation CPI since 2010</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
