import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chartColor } from '../lib/chart-colors';
import {
  BITCOIN_MAX_SUPPLY,
  LATEST_REPORTED_YEAR,
  btcSupplyMillionsAt,
  currentFractionalYear,
  m2TrillionsAt,
} from '../data/supplyData';

const BTC_GENESIS_YEAR = 2009;
const BTC_CAP_MILLIONS = BITCOIN_MAX_SUPPLY / 1e6;

interface SupplyScaleChartProps {
  startYear: number;
  endYear: number;
  growthPct: number;
}

interface Point {
  year: number;
  m2: number;
  btc: number | null;
}

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10];
  for (const step of steps) {
    if (value <= step * magnitude) return step * magnitude;
  }
  return 10 * magnitude;
}

function formatTrillions(value: number): string {
  if (value >= 100) return `$${Math.round(value).toLocaleString('en-US')}T`;
  if (value >= 10) return `$${value.toFixed(0)}T`;
  if (value >= 1) return `$${value.toFixed(1)}T`;
  return `$${value.toFixed(2)}T`;
}

/** Container width, so the chart can draw at 1:1 px instead of scaling text. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(node.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

/**
 * The cockpit key visual: USD M2 against Bitcoin's circulating supply and its
 * 21 million cap, redrawn live while the sliders move.
 *
 * Hand-rolled SVG on purpose — recharts is ~400 KB and only pays off for the
 * detailed inflation chart further down the page, which is loaded lazily
 * (WP-2.4). Colours come from the BoK series tokens via chart-colors.ts.
 */
export function SupplyScaleChart({ startYear, endYear, growthPct }: SupplyScaleChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const compact = width > 0 && width < 520;
  const height = Math.round(Math.max(240, Math.min(440, (width || 640) * 0.62)));
  const pad = {
    top: 18,
    right: compact ? 40 : 56,
    bottom: 28,
    left: compact ? 42 : 56,
  };
  const plotW = Math.max(10, (width || 640) - pad.left - pad.right);
  const plotH = Math.max(10, height - pad.top - pad.bottom);

  const points = useMemo<Point[]>(() => {
    const out: Point[] = [];
    for (let year = startYear; year <= endYear; year++) {
      out.push({
        year,
        m2: m2TrillionsAt(year, growthPct),
        btc: year >= BTC_GENESIS_YEAR ? btcSupplyMillionsAt(year) : null,
      });
    }
    return out;
  }, [startYear, endYear, growthPct]);

  const maxM2 = useMemo(
    () => niceCeil(Math.max(...points.map((p) => p.m2))),
    [points],
  );

  const x = useCallback(
    (year: number) =>
      pad.left + ((year - startYear) / Math.max(1, endYear - startYear)) * plotW,
    [pad.left, startYear, endYear, plotW],
  );
  const yM2 = useCallback(
    (value: number) => pad.top + plotH - (value / maxM2) * plotH,
    [pad.top, plotH, maxM2],
  );
  const yBtc = useCallback(
    (value: number) => pad.top + plotH - (value / BTC_CAP_MILLIONS) * plotH,
    [pad.top, plotH],
  );

  const splitYear = Math.min(Math.max(LATEST_REPORTED_YEAR, startYear), endYear);
  const reported = points.filter((p) => p.year <= splitYear);
  const scenario = points.filter((p) => p.year >= splitYear);

  const linePath = (rows: Point[], value: (p: Point) => number | null, yScale: (v: number) => number) => {
    let d = '';
    let open = false;
    for (const p of rows) {
      const v = value(p);
      if (v == null) {
        open = false;
        continue;
      }
      d += `${open ? 'L' : 'M'}${x(p.year).toFixed(1)},${yScale(v).toFixed(1)} `;
      open = true;
    }
    return d.trim();
  };

  const areaPath = (rows: Point[]) => {
    if (rows.length < 2) return '';
    const base = pad.top + plotH;
    const top = rows
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.year).toFixed(1)},${yM2(p.m2).toFixed(1)}`)
      .join(' ');
    return `${top} L${x(rows[rows.length - 1].year).toFixed(1)},${base.toFixed(1)} L${x(rows[0].year).toFixed(1)},${base.toFixed(1)} Z`;
  };

  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => (maxM2 / count) * i);
  }, [maxM2]);

  const xTicks = useMemo(() => {
    const span = endYear - startYear;
    const stride = span > 70 ? 20 : span > 40 ? 10 : span > 18 ? 5 : 2;
    const ticks: number[] = [];
    const first = Math.ceil(startYear / stride) * stride;
    for (let year = first; year <= endYear; year += stride) ticks.push(year);
    if (ticks[0] !== startYear) ticks.unshift(startYear);
    if (ticks[ticks.length - 1] !== endYear) ticks.push(endYear);
    return ticks;
  }, [startYear, endYear]);

  const today = currentFractionalYear();
  const todayInRange = today >= startYear && today <= endYear;

  const hovered = hoverYear == null ? null : points.find((p) => p.year === hoverYear) ?? null;

  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / Math.max(1, rect.width);
      const year = Math.round(startYear + ratio * (endYear - startYear));
      setHoverYear(Math.min(endYear, Math.max(startYear, year)));
    },
    [startYear, endYear],
  );

  const fiat = chartColor.fiat();
  const bitcoin = chartColor.bitcoin();
  const grid = chartColor.grid();
  const axis = chartColor.axis();
  const tooltipLeft = hovered
    ? Math.min(Math.max(x(hovered.year) - 80, 4), Math.max(4, (width || 640) - 168))
    : 0;

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={width || '100%'}
        height={height}
        role="img"
        aria-label={`US dollar M2 and Bitcoin supply, ${startYear} to ${endYear}`}
      >
        <defs>
          <linearGradient id="fiatFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor.fiat(0.22)} />
            <stop offset="100%" stopColor={chartColor.fiat(0)} />
          </linearGradient>
          <linearGradient id="fiatFillScenario" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor.fiat(0.1)} />
            <stop offset="100%" stopColor={chartColor.fiat(0)} />
          </linearGradient>
        </defs>

        {/* horizontal grid + left axis (USD M2) */}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={pad.left}
              x2={pad.left + plotW}
              y1={yM2(tick)}
              y2={yM2(tick)}
              stroke={grid}
              strokeDasharray={tick === 0 ? undefined : '3 3'}
            />
            <text
              x={pad.left - 8}
              y={yM2(tick) + 4}
              textAnchor="end"
              fontSize={compact ? 9 : 11}
              fill={axis}
            >
              {tick === 0 ? '0' : formatTrillions(tick)}
            </text>
          </g>
        ))}

        {/* right axis (BTC supply) */}
        {[0, 7, 14, 21].map((tick) => (
          <text
            key={`btc-${tick}`}
            x={pad.left + plotW + 8}
            y={yBtc(tick) + 4}
            fontSize={compact ? 9 : 11}
            fill={bitcoin}
          >
            {tick}M
          </text>
        ))}

        {/* 21M cap */}
        <line
          x1={pad.left}
          x2={pad.left + plotW}
          y1={yBtc(BTC_CAP_MILLIONS)}
          y2={yBtc(BTC_CAP_MILLIONS)}
          stroke={chartColor.bitcoin(0.45)}
          strokeDasharray="2 4"
        />
        <text
          x={pad.left + 6}
          y={yBtc(BTC_CAP_MILLIONS) + (compact ? 12 : 14)}
          fontSize={compact ? 9 : 11}
          fontWeight={700}
          fill={bitcoin}
        >
          21M cap
        </text>

        {/* x axis */}
        {xTicks.map((tick) => (
          <text
            key={`x-${tick}`}
            x={x(tick)}
            y={pad.top + plotH + 18}
            textAnchor="middle"
            fontSize={compact ? 9 : 11}
            fill={axis}
          >
            {tick}
          </text>
        ))}

        {/* USD M2 — reported, then scenario */}
        <path d={areaPath(reported)} fill="url(#fiatFill)" />
        <path d={areaPath(scenario)} fill="url(#fiatFillScenario)" />
        <path
          d={linePath(reported, (p) => p.m2, yM2)}
          fill="none"
          stroke={fiat}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path
          d={linePath(scenario, (p) => p.m2, yM2)}
          fill="none"
          stroke={fiat}
          strokeWidth={2.5}
          strokeDasharray="6 5"
          strokeLinecap="round"
        />

        {/* Bitcoin supply */}
        <path
          d={linePath(points, (p) => p.btc, yBtc)}
          fill="none"
          stroke={bitcoin}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Today marker, derived from the clock */}
        {todayInRange && (
          <>
            <line
              x1={x(today)}
              x2={x(today)}
              y1={pad.top}
              y2={pad.top + plotH}
              stroke={axis}
              strokeDasharray="5 5"
            />
            <text
              x={x(today)}
              y={pad.top - 6}
              textAnchor="middle"
              fontSize={compact ? 9 : 11}
              fontWeight={700}
              fill={axis}
            >
              Today
            </text>
          </>
        )}

        {/* hover tracker */}
        {hovered && (
          <>
            <line
              x1={x(hovered.year)}
              x2={x(hovered.year)}
              y1={pad.top}
              y2={pad.top + plotH}
              stroke={chartColor.text(0.25)}
            />
            <circle cx={x(hovered.year)} cy={yM2(hovered.m2)} r={4} fill={fiat} />
            {hovered.btc != null && (
              <circle cx={x(hovered.year)} cy={yBtc(hovered.btc)} r={4} fill={bitcoin} />
            )}
          </>
        )}

        <rect
          x={pad.left}
          y={pad.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={handlePointer}
          onPointerLeave={() => setHoverYear(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 w-40 rounded-lg border border-bok-border bg-bok-card p-2.5 text-xs shadow-sm"
          style={{ left: tooltipLeft }}
        >
          <p className="mb-1 font-semibold text-bok-text">
            {hovered.year}
            {hovered.year > LATEST_REPORTED_YEAR && (
              <span className="ml-1 font-normal text-bok-muted">scenario</span>
            )}
          </p>
          <p className="tabular-nums text-series-3">USD M2 {formatTrillions(hovered.m2)}</p>
          {hovered.btc != null && (
            <p className="tabular-nums text-bitcoin-orange">
              BTC {hovered.btc.toFixed(2)}M
            </p>
          )}
          {hovered.btc != null && hovered.btc > 0 && (
            <p className="mt-1 tabular-nums text-bok-muted">
              ${(((hovered.m2 * 1e12) / (hovered.btc * 1e6)) / 1e6).toFixed(2)}M M2 per BTC
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SupplyScaleChart;
