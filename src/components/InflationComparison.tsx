import { useMemo } from 'react';
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
import { BokDataNotice } from '../../../../CI/web/BokDataNotice';
import {
  BTC_SUPPLY_YOY_CHART_FROM,
  CURRENT_YEAR,
  getLatestBtcSupplyInflationYoY,
  supplyData,
} from '../data/supplyData';
import {
  truflationAnnualData,
  TRUFLATION_PEAK_YOY,
  TRUFLATION_PEAK_LABEL,
  TRUFLATION_START_YEAR,
  TRUFLATION_END_YEAR,
  TRUFLATION_LATEST_YOY,
  TRUFLATION_SOURCE_LABEL,
  EXTENDED_HISTORY_START_YEAR,
  getTruflationPoint,
} from '../data/truflationInflation';
import {
  formatBtcPriceUsd,
  useBitcoinHistoricalPrices,
} from '../hooks/useBitcoinHistoricalPrices';
import { useBtcPrice } from '../context/BtcPriceContext';
import { chartColor } from '../lib/chart-colors';
import { SectionHeader } from './SectionHeader';

const truflationByYear = new Map(truflationAnnualData.map((p) => [p.year, p]));

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
  years.add(CURRENT_YEAR);

  return Array.from(years)
    .sort((a, b) => a - b)
    .map((year) => {
      const tf = truflationByYear.get(year);
      const supply = supplyData.find((d) => d.year === year);
      const historicalPrice = priceByYear.get(year);
      const btcPrice =
        year === CURRENT_YEAR && liveBtcPriceUsd > 0
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
    <div className="bok-card border border-bok-border p-4">
      <p className="mb-2 text-sm font-semibold tabular-nums text-bok-text">{label}</p>
      {payload.map((entry) => {
        if (entry.value == null) return null;
        if (entry.dataKey === 'usd') {
          const labelText =
            row?.usdSource === 'm2' ? 'USD inflation (M2 YoY)' : 'Truflation CPI';
          return (
            <p key={entry.dataKey} className="text-sm tabular-nums text-series-3">
              {labelText}: {entry.value.toFixed(1)}%
            </p>
          );
        }
        if (entry.dataKey === 'btc') {
          return (
            <p key={entry.dataKey} className="text-sm tabular-nums text-bitcoin-orange">
              BTC circulation YoY: {entry.value.toFixed(2)}%
            </p>
          );
        }
        if (entry.dataKey === 'btcPrice') {
          return (
            <p key={entry.dataKey} className="text-sm tabular-nums text-series-2">
              BTC price: {formatBtcPriceUsd(entry.value)}
            </p>
          );
        }
        return null;
      })}
      {point?.blsCpiYoY != null && (
        <p className="mt-2 text-xs tabular-nums text-bok-muted">
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
  const {
    priceByYear,
    loading: pricesLoading,
    error: pricesError,
    refetch: refetchPrices,
  } = useBitcoinHistoricalPrices();
  const { btcPriceUsd, isLivePrice } = useBtcPrice();

  const chartData = useMemo(
    () => buildChartRows(priceByYear, isLivePrice ? btcPriceUsd : 0),
    [priceByYear, btcPriceUsd, isLivePrice],
  );

  const brushStartIndex = Math.max(
    0,
    chartData.findIndex((d) => d.year >= TRUFLATION_START_YEAR),
  );
  const brushEndIndex = Math.max(brushStartIndex, chartData.length - 1);

  /* Colours resolved from the BoK series tokens — no chart hex in this site
     (CI/web decision 2026-09-08). */
  const fiat = chartColor.fiat();
  const bitcoin = chartColor.bitcoin();
  const price = chartColor.price();
  const grid = chartColor.grid();
  const axis = chartColor.axis();
  const axisLine = chartColor.axis(0.6);

  const latestBtcSupplyYoY = getLatestBtcSupplyInflationYoY();
  const highlights = [
    {
      value: `${TRUFLATION_PEAK_YOY}%`,
      label: `Peak Truflation CPI (${TRUFLATION_PEAK_LABEL})`,
      accent: 'fiat' as const,
    },
    {
      value: `${TRUFLATION_LATEST_YOY.toFixed(1)}%`,
      label: `Truflation CPI, ${TRUFLATION_END_YEAR} annual figure`,
      accent: 'fiat' as const,
    },
    {
      value: isLivePrice ? formatBtcPriceUsd(btcPriceUsd) : '—',
      label: isLivePrice
        ? `BTC price now · ${latestBtcSupplyYoY.toFixed(2)}% circulation YoY`
        : `Live BTC price unavailable · ${latestBtcSupplyYoY.toFixed(2)}% circulation YoY`,
      accent: 'bitcoin' as const,
    },
  ];

  return (
    <section ref={ref} className="section-shell bg-bok-surface">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="04"
          kickerLabel="Inflation"
          align="center"
          inView={inView}
          title={<>Inflation <span className="gradient-text-fiat">rates</span></>}
          subtitle={`Truflation CPI for the dollar against Bitcoin's circulation growth (YoY, from ${BTC_SUPPLY_YOY_CHART_FROM}) — plus the BTC dollar price since ${TRUFLATION_START_YEAR}.`}
        />

        <div
          className={`reveal ${inView ? 'reveal-in' : ''} bok-card mb-6 p-5 sm:p-8`}
          style={{ transitionDelay: '0.1s' }}
        >
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-series-3" />
              <span className="text-sm text-bok-text">Truflation CPI YoY (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-bitcoin-orange" />
              <span className="text-sm text-bok-text">BTC circulation YoY (%)</span>
            </div>
            {!pricesError && (
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-series-2" />
                <span className="text-sm text-bok-text">BTC price (USD, log scale)</span>
              </div>
            )}
          </div>

          <div className="h-[420px] sm:h-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 48, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  allowDecimals={false}
                  stroke={axisLine}
                  tick={{ fill: axis, fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="pct"
                  stroke={axisLine}
                  tick={{ fill: axis, fontSize: 12 }}
                  label={{
                    value: 'Inflation (%)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: axis,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  yAxisId="price"
                  orientation="right"
                  scale="log"
                  domain={[0.05, 'auto']}
                  stroke={axisLine}
                  tick={{ fill: axis, fontSize: 11 }}
                  tickFormatter={priceTick}
                  label={{
                    value: 'BTC price',
                    angle: 90,
                    position: 'insideRight',
                    fill: axis,
                    fontSize: 11,
                  }}
                />
                <Tooltip content={<InflationTooltip />} />
                <ReferenceLine
                  x={CURRENT_YEAR}
                  stroke={axisLine}
                  strokeDasharray="5 5"
                  label={{ value: 'Now', fill: axis, fontSize: 11 }}
                />
                <ReferenceLine yAxisId="pct" y={0} stroke={axisLine} />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="usd"
                  stroke={fiat}
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ fill: fiat, r: 3 }}
                  activeDot={{ r: 5, fill: chartColor.fiat(0.7) }}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="btc"
                  stroke={bitcoin}
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ fill: bitcoin, r: 3 }}
                  activeDot={{ r: 5, fill: chartColor.bitcoin(0.7) }}
                />
                {!pricesError && (
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="btcPrice"
                    stroke={price}
                    strokeWidth={2}
                    connectNulls
                    dot={{ fill: price, r: 2.5 }}
                    activeDot={{ r: 4, fill: chartColor.price(0.7) }}
                  />
                )}
                {chartData.length > 0 && (
                  <Brush
                    dataKey="year"
                    height={32}
                    stroke={grid}
                    fill={chartColor.card()}
                    travellerWidth={10}
                    startIndex={brushStartIndex}
                    endIndex={brushEndIndex}
                    tickFormatter={(year) => String(year)}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-4 border-t border-bok-border pt-4 text-xs leading-relaxed text-bok-muted">
            {TRUFLATION_SOURCE_LABEL}. Bitcoin circulation growth follows the protocol issuance
            schedule; the dollar price series comes from the Bits of Knowledge price service.
          </p>

          {pricesError && (
            <div className="mt-4">
              <BokDataNotice lang="en" onRetry={refetchPrices}>
                <p style={{ margin: 0 }}>
                  The historical bitcoin price series is not reachable right now, so the price
                  line is hidden rather than drawn from an old snapshot. The inflation and
                  circulation series are unaffected.
                </p>
              </BokDataNotice>
            </div>
          )}
          {pricesLoading && !pricesError && (
            <p className="mt-2 text-xs text-bok-muted">Loading the price series…</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {highlights.map((item, i) => (
            <div
              key={item.label}
              className={`reveal ${inView ? 'reveal-in' : ''} bok-card p-5`}
              style={{ transitionDelay: `${0.2 + i * 0.08}s` }}
            >
              <p
                className={`data-metric mb-2 ${
                  item.accent === 'fiat' ? 'text-series-3' : 'text-bitcoin-orange'
                }`}
              >
                {item.value}
              </p>
              <p className="text-sm leading-relaxed text-bok-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InflationComparison;
