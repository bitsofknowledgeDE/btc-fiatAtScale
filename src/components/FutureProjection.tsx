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
    <div className="glass-card border border-bok-border p-4">
      <p className="mb-2 text-sm font-semibold text-bok-text">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm">
          <span className={entry.dataKey === 'usd' ? 'text-emerald-700' : 'text-bitcoin-orange'}>
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
    <section ref={ref} className="section-shell bg-bok-surface">
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
          <p className="mb-4 text-sm font-medium text-bok-text">USD M2 supply, 1960-2050 (trillions)</p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
              <span className="text-xs text-bok-muted">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm border border-emerald-700 bg-emerald-800" />
              <span className="text-xs text-bok-muted">Projected</span>
            </div>
          </div>
          <div className="h-[340px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[yearMin, yearMax]}
                  ticks={yearTicks}
                  stroke="#94A3B8"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  scale="linear"
                />
                <YAxis
                  stroke="#94A3B8"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  label={{ value: 'USD Trillions', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip content={<ProjectionTooltip />} />
                <ReferenceLine x={2026} stroke="#F7931A" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: 'Today', fill: '#D97706', fontSize: 11, position: 'top' }} />
                <Bar dataKey="usd" radius={[3, 3, 0, 0]} barSize={12}>
                  {projectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.projected ? '#166534' : '#16865A'} opacity={entry.projected ? 0.78 : 1} />
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
            className="glass-card bg-emerald-50 p-6"
          >
            <p className="data-metric mb-2 text-emerald-700">{multiplier2050}x</p>
            <p className="text-sm text-bok-muted">Projected USD supply growth by 2050</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.32 }}
            className="glass-card p-6"
          >
            <p className="data-metric mb-2 text-bitcoin-orange">0%</p>
            <p className="text-sm text-bok-muted">BTC growth after ~2140</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.39 }}
            className="glass-card p-6"
          >
            <p className="data-metric mb-2 text-bok-text">{avgTruflationSince2010.toFixed(1)}%</p>
            <p className="text-sm text-bok-muted">Avg. Truflation CPI since 2010</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
