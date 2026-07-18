import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts';
import {
  BTC_SUPPLY_YOY_CHART_FROM,
  getLatestBtcSupplyInflationYoY,
  supplyData,
} from '../data/supplyData';
import {
  truflationAnnualData,
  TRUFLATION_PEAK_YOY,
  TRUFLATION_PEAK_LABEL,
  TRUFLATION_START_YEAR,
  EXTENDED_HISTORY_START_YEAR,
  getTruflationPoint,
} from '../data/truflationInflation';
import { useTruflationInflation } from '../hooks/useTruflationInflation';
import {
  formatBtcPriceUsd,
  useBitcoinHistoricalPrices,
} from '../hooks/useBitcoinHistoricalPrices';
import { useBtcPrice } from '../context/BtcPriceContext';
import { SectionHeader } from './SectionHeader';

const truflationByYear = new Map(truflationAnnualData.map((p) => [p.year, p]));
const currentYear = new Date().getFullYear();

interface ChartRow {
  year: number;
  usd: number | null;
  usdSource: 'truflation' | 'm2' | null;
  bls: number | null;
  btc: number | null;
  btcPrice: number | null;
}

function buildChartRows(
  priceByYear: Map<number, number>,
  liveBtcPriceUsd: number,
): ChartRow[] {
  const years = new Set<number>();
  supplyData
    .filter((d) => d.year >= EXTENDED_HISTORY_START_YEAR && !d.projected)
    .forEach((d) => years.add(d.year));
  truflationAnnualData.forEach((p) => years.add(p.year));
  priceByYear.forEach((_, year) => years.add(year));
  years.add(currentYear);

  return Array.from(years)
    .sort((a, b) => a - b)
    .map((year) => {
      const tf = truflationByYear.get(year);
      const supply = supplyData.find((d) => d.year === year);
      const historicalPrice = priceByYear.get(year);
      const btcPrice =
        year === currentYear && liveBtcPriceUsd > 0
          ? liveBtcPriceUsd
          : historicalPrice ?? null;

      const btcYoY =
        year >= BTC_SUPPLY_YOY_CHART_FROM ? supply?.btcInflationRate ?? null : null;

      let usd: number | null = null;
      let usdSource: ChartRow['usdSource'] = null;
      if (tf) {
        usd = tf.truflationCpiYoY;
        usdSource = 'truflation';
      } else if (year < TRUFLATION_START_YEAR && supply?.usdInflationRate != null) {
        usd = supply.usdInflationRate;
        usdSource = 'm2';
      }

      return {
        year,
        usd,
        usdSource,
        bls: tf?.blsCpiYoY ?? null,
        btc: btcYoY,
        btcPrice,
      };
    });
}

function InflationTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number | null;
    dataKey: string;
    payload?: ChartRow;
  }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const point = getTruflationPoint(label ?? 0);
  const row = payload[0]?.payload;

  return (
    <div className="bok-card p-4 border border-bok-border">
      <p className="mb-2 text-sm font-semibold text-bok-text">{label}</p>
      {payload.map((entry) => {
        if (entry.value == null) return null;
        if (entry.dataKey === 'usd') {
          const labelText =
            row?.usdSource === 'm2' ? 'USD inflation (M2 YoY)' : 'Truflation CPI';
          return (
            <p key={entry.dataKey} className="text-sm text-emerald-700">
              {labelText}: {entry.value.toFixed(1)}%
            </p>
          );
        }
        if (entry.dataKey === 'btc') {
          return (
            <p key={entry.dataKey} className="text-sm text-bitcoin-orange">
              BTC circulation YoY: {entry.value.toFixed(2)}%
            </p>
          );
        }
        if (entry.dataKey === 'btcPrice') {
          return (
            <p key={entry.dataKey} className="text-sm text-blue-700">
              BTC price: {formatBtcPriceUsd(entry.value)}
            </p>
          );
        }
        return null;
      })}
      {point?.blsCpiYoY != null && (
        <p className="text-xs text-bok-muted mt-2">
          BLS CPI (official): {point.blsCpiYoY.toFixed(1)}%
        </p>
      )}
    </div>
  );
}

function priceTick(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  if (value >= 1) return `$${Math.round(value)}`;
  return `$${value.toFixed(2)}`;
}

export function InflationComparison() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });
  const { currentYoY, asOfDate, isLive, loading: truflationLoading } = useTruflationInflation();
  const { priceByYear, loading: pricesLoading } = useBitcoinHistoricalPrices();
  const { btcPriceUsd } = useBtcPrice();

  const chartData = useMemo(
    () => buildChartRows(priceByYear, btcPriceUsd),
    [priceByYear, btcPriceUsd],
  );

  const brushStartIndex = Math.max(
    0,
    chartData.findIndex((d) => d.year >= TRUFLATION_START_YEAR),
  );
  const brushEndIndex = chartData.length - 1;

  const currentLabel = truflationLoading ? '…' : `${currentYoY.toFixed(1)}%`;

  const latestBtcSupplyYoY = getLatestBtcSupplyInflationYoY();
  const highlights = [
    {
      value: `${TRUFLATION_PEAK_YOY}%`,
      label: `Peak Truflation CPI (${TRUFLATION_PEAK_LABEL})`,
      accent: 'fiat' as const,
    },
    {
      value: currentLabel,
      label: isLive
        ? `Truflation CPI now${asOfDate ? ` (${asOfDate})` : ''}`
        : 'Truflation CPI (latest annual est.)',
      accent: 'fiat' as const,
    },
    {
      value: pricesLoading ? '…' : formatBtcPriceUsd(btcPriceUsd),
      label: `BTC price now · ${latestBtcSupplyYoY.toFixed(2)}% circulation YoY`,
      accent: 'bitcoin' as const,
    },
  ];

  return (
    <section ref={ref} className="section-shell bg-bok-surface">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          kicker="04"
          kickerLabel="Inflation"
          align="center"
          inView={inView}
          title={<>Inflation <span className="gradient-text-fiat">rates</span></>}
          subtitle="Truflation CPI for USD vs. BTC circulation growth (YoY, from 2013) — plus BTC dollar price since 2010."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bok-card p-5 sm:p-8 mb-6"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="text-sm text-bok-text">Truflation CPI YoY (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-bitcoin-orange" />
              <span className="text-sm text-bok-text">BTC circulation YoY (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              <span className="text-sm text-bok-text">BTC price (USD, log scale)</span>
            </div>
          </div>

          <div className="h-[420px] sm:h-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 48, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  allowDecimals={false}
                  stroke="#94A3B8"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="pct"
                  stroke="#94A3B8"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  label={{
                    value: 'Inflation (%)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748B',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  yAxisId="price"
                  orientation="right"
                  scale="log"
                  domain={[0.05, 'auto']}
                  stroke="#94A3B8"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={priceTick}
                  label={{
                    value: 'BTC price',
                    angle: 90,
                    position: 'insideRight',
                    fill: '#64748B',
                    fontSize: 11,
                  }}
                />
                <Tooltip content={<InflationTooltip />} />
                <ReferenceLine
                  x={currentYear}
                  stroke="#94A3B8"
                  strokeDasharray="5 5"
                  label={{ value: 'Now', fill: '#64748B', fontSize: 11 }}
                />
                <ReferenceLine yAxisId="pct" y={0} stroke="#94A3B8" />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="usd"
                  stroke="#16865A"
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ fill: '#16865A', r: 3 }}
                  activeDot={{ r: 5, fill: '#34A373' }}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="btc"
                  stroke="#F7931A"
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ fill: '#F7931A', r: 3 }}
                  activeDot={{ r: 5, fill: '#FDBA74' }}
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="btcPrice"
                  stroke="#2563EB"
                  strokeWidth={2}
                  connectNulls
                  dot={{ fill: '#2563EB', r: 2.5 }}
                  activeDot={{ r: 4, fill: '#60A5FA' }}
                />
                {chartData.length > 0 && (
                  <Brush
                    dataKey="year"
                    height={32}
                    stroke="#CBD5E1"
                    fill="#FFFFFF"
                    travellerWidth={10}
                    startIndex={brushStartIndex}
                    endIndex={brushEndIndex}
                    tickFormatter={(year) => String(year)}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bok-card p-5"
            >
              <p
                className={`data-metric mb-2 ${
                  item.accent === 'fiat' ? 'text-emerald-700' : 'text-bitcoin-orange'
                }`}
              >
                {item.value}
              </p>
              <p className="text-sm text-bok-muted leading-relaxed">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
