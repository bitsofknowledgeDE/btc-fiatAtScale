export interface SupplyDataPoint {
  year: number;
  usdM2Trillions: number;
  btcSupplyMillions: number;
  btcPriceUSD: number | null;
  usdInflationRate: number;
  btcInflationRate: number;
  projected?: boolean;
}

/** Current calendar year — every "projected"/"today" decision derives from it,
 *  so no year is ever pinned in code (WP-6, decision 2026-09-08). */
export const CURRENT_YEAR = new Date().getFullYear();

/** Fractional year of the current date, for the "Today" marker on charts. */
export function currentFractionalYear(now: Date = new Date()): number {
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  const end = Date.UTC(now.getUTCFullYear() + 1, 0, 1);
  return now.getUTCFullYear() + (now.getTime() - start) / (end - start);
}

/** First year shown on the inflation chart — pre-2013 YoY was >30% (bootstrap phase). */
export const BTC_SUPPLY_YOY_CHART_FROM = 2013;

export const BITCOIN_MAX_SUPPLY = 21_000_000;
export const BTC_MINED_PER_BLOCK = 3.125;
export const BTC_BLOCK_TIME_MINUTES = 10;
export const BTC_BLOCKS_PER_DAY = 6 * 24;
export const BTC_PER_DAY = BTC_MINED_PER_BLOCK * BTC_BLOCKS_PER_DAY;

export interface HalvingEvent {
  date: string;
  blockReward: number;
  totalSupplyAtHalving: number;
  inflationRate: number;
}

export const halvingSchedule: HalvingEvent[] = [
  { date: '2009-01-03', blockReward: 50, totalSupplyAtHalving: 0, inflationRate: 100 },
  { date: '2012-11-28', blockReward: 25, totalSupplyAtHalving: 10_500_000, inflationRate: 12.5 },
  { date: '2016-07-09', blockReward: 12.5, totalSupplyAtHalving: 15_750_000, inflationRate: 4.2 },
  { date: '2020-05-11', blockReward: 6.25, totalSupplyAtHalving: 18_375_000, inflationRate: 1.8 },
  { date: '2024-04-20', blockReward: 3.125, totalSupplyAtHalving: 19_687_500, inflationRate: 0.85 },
  { date: '2028-04-01', blockReward: 1.5625, totalSupplyAtHalving: 20_343_750, inflationRate: 0.4 },
  { date: '2032-04-01', blockReward: 0.78125, totalSupplyAtHalving: 20_671_875, inflationRate: 0.2 },
];

const halvingStamps = halvingSchedule
  .map((h) => ({ time: Date.parse(h.date), reward: h.blockReward }))
  .sort((a, b) => a.time - b.time);

/** 210,000 blocks at the 10 min target ≈ 3.9993 years. */
const HALVING_INTERVAL_MS = 210_000 * BTC_BLOCK_TIME_MINUTES * 60_000;

/**
 * Block reward in force at a point in time. Beyond the last halving the table
 * lists, the schedule simply keeps halving every 210,000 blocks — without that
 * continuation the curve would keep minting at the 2032 rate and hit 21M far
 * too early.
 */
function blockRewardAt(time: number): number {
  const last = halvingStamps[halvingStamps.length - 1];
  if (time >= last.time) {
    const epochs = Math.floor((time - last.time) / HALVING_INTERVAL_MS);
    const reward = last.reward / Math.pow(2, epochs);
    return reward < 1e-8 ? 0 : reward;
  }
  let reward = halvingStamps[0].reward;
  for (const stamp of halvingStamps) {
    if (stamp.time <= time) reward = stamp.reward;
    else break;
  }
  return reward;
}

/**
 * Observed year-end circulating supply (millions), Dec 31 totals.
 * Only years that have actually happened live here — everything after the
 * anchor is integrated from the issuance schedule below, so no future row can
 * go stale in the file (the hand-typed 2026 row used to sit 0.16M too low,
 * which showed up in the UI as "0.01 % circulation YoY").
 */
const OBSERVED_BTC_YEAR_END_SUPPLY_M: Record<number, number> = {
  2009: 1.62445,
  2010: 5.02045,
  2011: 8.0018,
  2012: 10.61403,
  2013: 12.19985,
  2014: 13.67148,
  2015: 15.02633,
  2016: 16.0792,
  2017: 16.75483,
  2018: 17.36733,
  2019: 18.03583,
  2020: 18.58783,
  2021: 19.12483,
  2022: 19.48783,
  2023: 19.85083,
  2024: 19.91875,
  2025: 19.951,
};

/** Last year-end with an observed total — the anchor of the projection. */
const BTC_ANCHOR_YEAR = Math.max(...Object.keys(OBSERVED_BTC_YEAR_END_SUPPLY_M).map(Number));

/**
 * Circulating supply (millions) at any instant after the anchor: protocol
 * issuance integrated month by month at the ~10 min block target. Bitcoin's
 * issuance is deterministic, so this is schedule arithmetic, not a forecast.
 */
function btcSupplyMillionsAtTime(time: number): number {
  const anchorEnd = Date.UTC(BTC_ANCHOR_YEAR + 1, 0, 1);
  let supply = OBSERVED_BTC_YEAR_END_SUPPLY_M[BTC_ANCHOR_YEAR];
  if (time <= anchorEnd) return supply;

  let cursor = anchorEnd;
  while (cursor < time) {
    const next = Math.min(
      time,
      Date.UTC(
        new Date(cursor).getUTCFullYear(),
        new Date(cursor).getUTCMonth() + 1,
        1,
      ),
    );
    const days = (next - cursor) / 86_400_000;
    supply += (blockRewardAt(cursor) * BTC_BLOCKS_PER_DAY * days) / 1e6;
    cursor = next;
  }
  return Math.min(supply, BITCOIN_MAX_SUPPLY / 1e6);
}

/** The years the supply curve is sampled at beyond the anchor. */
const PROJECTED_SUPPLY_YEARS = [2026, 2027, 2028, 2030, 2032, 2035, 2040, 2050];

/**
 * Year-end circulating BTC supply (millions): observed totals up to the anchor,
 * protocol issuance after it.
 */
export const BTC_YEAR_END_SUPPLY_M: Record<number, number> = {
  ...OBSERVED_BTC_YEAR_END_SUPPLY_M,
  ...Object.fromEntries(
    PROJECTED_SUPPLY_YEARS.filter((year) => year > BTC_ANCHOR_YEAR).map((year) => [
      year,
      Number(btcSupplyMillionsAtTime(Date.UTC(year + 1, 0, 1)).toFixed(5)),
    ]),
  ),
};

type SupplyRowBase = Omit<SupplyDataPoint, 'btcInflationRate' | 'projected'>;

// Historical USD M2 (trillions) — Federal Reserve. BTC price is approximate annual average.
// Rows past the current year are scenario values; the `projected` flag is
// derived from the calendar, never written into the rows.
const supplyRowsBase: SupplyRowBase[] = [
  { year: 1960, usdM2Trillions: 0.30, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 4.8 },
  { year: 1965, usdM2Trillions: 0.45, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 7.5 },
  { year: 1970, usdM2Trillions: 0.63, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 8.4 },
  { year: 1971, usdM2Trillions: 0.71, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 12.7 },
  { year: 1975, usdM2Trillions: 1.02, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 12.5 },
  { year: 1980, usdM2Trillions: 1.60, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 9.1 },
  { year: 1985, usdM2Trillions: 2.50, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 9.3 },
  { year: 1990, usdM2Trillions: 3.28, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 5.1 },
  { year: 1995, usdM2Trillions: 3.64, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 4.2 },
  { year: 2000, usdM2Trillions: 4.92, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 6.2 },
  { year: 2001, usdM2Trillions: 5.43, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 10.4 },
  { year: 2005, usdM2Trillions: 6.66, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 4.5 },
  { year: 2008, usdM2Trillions: 8.18, btcSupplyMillions: 0, btcPriceUSD: null, usdInflationRate: 9.8 },
  { year: 2009, usdM2Trillions: 8.5, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2009], btcPriceUSD: 0, usdInflationRate: 3.8 },
  { year: 2010, usdM2Trillions: 8.8, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2010], btcPriceUSD: 0.06, usdInflationRate: 3.5 },
  { year: 2011, usdM2Trillions: 9.6, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2011], btcPriceUSD: 6, usdInflationRate: 9.1 },
  { year: 2012, usdM2Trillions: 10.4, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2012], btcPriceUSD: 12, usdInflationRate: 8.3 },
  { year: 2013, usdM2Trillions: 10.9, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2013], btcPriceUSD: 140, usdInflationRate: 4.8 },
  { year: 2014, usdM2Trillions: 11.5, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2014], btcPriceUSD: 525, usdInflationRate: 5.5 },
  { year: 2015, usdM2Trillions: 12.0, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2015], btcPriceUSD: 272, usdInflationRate: 4.3 },
  { year: 2016, usdM2Trillions: 13.0, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2016], btcPriceUSD: 567, usdInflationRate: 8.3 },
  { year: 2017, usdM2Trillions: 13.8, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2017], btcPriceUSD: 4000, usdInflationRate: 6.2 },
  { year: 2018, usdM2Trillions: 14.3, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2018], btcPriceUSD: 7500, usdInflationRate: 3.6 },
  { year: 2019, usdM2Trillions: 15.3, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2019], btcPriceUSD: 7200, usdInflationRate: 7.0 },
  { year: 2020, usdM2Trillions: 19.1, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2020], btcPriceUSD: 11000, usdInflationRate: 24.8 },
  { year: 2021, usdM2Trillions: 21.6, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2021], btcPriceUSD: 47000, usdInflationRate: 13.1 },
  { year: 2022, usdM2Trillions: 21.4, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2022], btcPriceUSD: 28000, usdInflationRate: -0.9 },
  { year: 2023, usdM2Trillions: 20.8, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2023], btcPriceUSD: 30000, usdInflationRate: -2.8 },
  { year: 2024, usdM2Trillions: 21.2, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2024], btcPriceUSD: 62000, usdInflationRate: 1.9 },
  { year: 2025, usdM2Trillions: 21.7, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2025], btcPriceUSD: 95000, usdInflationRate: 2.4 },
  { year: 2026, usdM2Trillions: 22.3, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2026], btcPriceUSD: null, usdInflationRate: 2.8 },
  { year: 2028, usdM2Trillions: 24.0, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2028], btcPriceUSD: null, usdInflationRate: 3.5 },
  { year: 2030, usdM2Trillions: 26.5, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2030], btcPriceUSD: null, usdInflationRate: 4.2 },
  { year: 2032, usdM2Trillions: 29.8, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2032], btcPriceUSD: null, usdInflationRate: 5.0 },
  { year: 2035, usdM2Trillions: 35.2, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2035], btcPriceUSD: null, usdInflationRate: 5.5 },
  { year: 2040, usdM2Trillions: 48.0, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2040], btcPriceUSD: null, usdInflationRate: 6.0 },
  { year: 2050, usdM2Trillions: 85.0, btcSupplyMillions: BTC_YEAR_END_SUPPLY_M[2050], btcPriceUSD: null, usdInflationRate: 7.0 },
];

/** YoY change in circulating supply: (end − prior end) / prior end × 100 */
export function computeBtcSupplyInflationYoY(
  rows: Pick<SupplyDataPoint, 'year' | 'btcSupplyMillions'>[],
): Map<number, number> {
  const sorted = [...rows]
    .filter((r) => r.btcSupplyMillions > 0)
    .sort((a, b) => a.year - b.year);

  const rates = new Map<number, number>();
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    rates.set(
      curr.year,
      ((curr.btcSupplyMillions - prev.btcSupplyMillions) / prev.btcSupplyMillions) * 100,
    );
  }
  return rates;
}

const btcInflationByYear = computeBtcSupplyInflationYoY(supplyRowsBase);

export const supplyData: SupplyDataPoint[] = supplyRowsBase.map((row) => ({
  ...row,
  btcInflationRate: btcInflationByYear.get(row.year) ?? 0,
  /** Derived, not stored: a row is a projection exactly while its year is
   *  still in the future (WP-6 — the 2026 row used to stay "projected"
   *  forever). */
  projected: row.year > CURRENT_YEAR,
}));

/** Latest non-projected YoY supply growth (for stat cards). */
export function getLatestBtcSupplyInflationYoY(): number {
  const latest = [...supplyData]
    .filter((d) => d.btcSupplyMillions > 0 && !d.projected)
    .sort((a, b) => b.year - a.year)[0];
  return latest?.btcInflationRate ?? 0;
}

/* ── Reported vs. scenario ─────────────────────────────────────────────────
   Everything up to and including the current year is treated as reported
   data; everything after it is produced by the growth scenario the visitor
   sets in the cockpit, so no fixed forecast is baked into the UI. */

const reportedRows = supplyData.filter((d) => !d.projected);

/** Last year with a reported M2 figure. */
export const LATEST_REPORTED_YEAR = reportedRows[reportedRows.length - 1].year;

/** M2 (trillions) in `LATEST_REPORTED_YEAR` — the scenario base. */
export const LATEST_REPORTED_M2_TRILLIONS =
  reportedRows[reportedRows.length - 1].usdM2Trillions;

/** First year of the dataset. */
export const HISTORY_START_YEAR = supplyData[0].year;

/** Last year the BTC supply table covers — the furthest honest horizon. */
export const SUPPLY_TABLE_END_YEAR = Math.max(
  ...Object.keys(BTC_YEAR_END_SUPPLY_M).map(Number),
);

/** Linear interpolation over a sparse year→value table. */
function interpolate(points: { year: number; value: number }[], year: number): number {
  if (year <= points[0].year) return points[0].value;
  const last = points[points.length - 1];
  if (year >= last.year) return last.value;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (year <= b.year) {
      const t = (year - a.year) / (b.year - a.year);
      return a.value + (b.value - a.value) * t;
    }
  }
  return last.value;
}

const reportedM2Points = reportedRows.map((d) => ({ year: d.year, value: d.usdM2Trillions }));

const btcSupplyPoints = Object.keys(BTC_YEAR_END_SUPPLY_M)
  .map(Number)
  .sort((a, b) => a - b)
  .map((year) => ({ year, value: BTC_YEAR_END_SUPPLY_M[year] }));

/** Reported USD M2 (trillions) for any year up to `LATEST_REPORTED_YEAR`. */
export function reportedM2Trillions(year: number): number {
  return interpolate(reportedM2Points, year);
}

/**
 * USD M2 (trillions) for any year: reported until `LATEST_REPORTED_YEAR`,
 * then compounded at `annualGrowthPct` per year.
 */
export function m2TrillionsAt(year: number, annualGrowthPct: number): number {
  if (year <= LATEST_REPORTED_YEAR) return reportedM2Trillions(year);
  const years = year - LATEST_REPORTED_YEAR;
  return LATEST_REPORTED_M2_TRILLIONS * Math.pow(1 + annualGrowthPct / 100, years);
}

/** Circulating BTC supply (millions) for a year; 0 before the genesis year. */
export function btcSupplyMillionsAt(year: number): number {
  if (year < btcSupplyPoints[0].year) return 0;
  return interpolate(btcSupplyPoints, year);
}

/**
 * The growth rate the dataset's own long-range row implies, used as the
 * slider default instead of a hard-coded percentage.
 */
export const DEFAULT_M2_GROWTH_PCT = (() => {
  const target = supplyData.find((d) => d.year === SUPPLY_TABLE_END_YEAR);
  if (!target || target.year <= LATEST_REPORTED_YEAR) return 5.5;
  const years = target.year - LATEST_REPORTED_YEAR;
  const cagr =
    Math.pow(target.usdM2Trillions / LATEST_REPORTED_M2_TRILLIONS, 1 / years) - 1;
  return Math.round(cagr * 1000) / 10;
})();

/**
 * Circulating supply used while the live network query is in flight or down —
 * read off the issuance schedule for the current moment instead of a number
 * frozen into the file (WP-6).
 */
export const FALLBACK_CIRCULATING_SUPPLY = Math.round(
  btcSupplyMillionsAtTime(Date.now()) * 1e6,
);

/** Latest reported M2 in dollars — derived, so it moves with the dataset. */
export const CURRENT_USD_M2 = LATEST_REPORTED_M2_TRILLIONS * 1e12;
export const USD_PRINTED_PER_SECOND = 34_722; // ~$3B/day average in recent years

export interface BtcEmissionRates {
  btcPerSecond: number;
  satsPerSecond: number;
  btcPerDay: number;
  btcPerYear: number;
}

/** Protocol emission from block reward and ~10 min average block time. */
export function computeBtcEmissionRates(blockReward: number): BtcEmissionRates {
  const blockTimeSeconds = BTC_BLOCK_TIME_MINUTES * 60;
  const btcPerSecond = blockReward / blockTimeSeconds;
  const btcPerDay = blockReward * BTC_BLOCKS_PER_DAY;
  return {
    btcPerSecond,
    satsPerSecond: btcPerSecond * 100_000_000,
    btcPerDay,
    btcPerYear: btcPerDay * 365,
  };
}

export const FALLBACK_BTC_EMISSION = computeBtcEmissionRates(BTC_MINED_PER_BLOCK);

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function formatBTC(num: number): string {
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M BTC`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K BTC`;
  return `${num.toFixed(2)} BTC`;
}
