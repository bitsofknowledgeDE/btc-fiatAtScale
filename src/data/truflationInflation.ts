/**
 * Truflation US CPI YoY (%), annual figures.
 * Backtested series (2010+) from Truflation's independent daily index — not BLS / M2 growth.
 *
 * This is a STATIC dataset. The site used to try a client-side call to
 * api.truflation.com with `VITE_TRUFULATION_API_KEY`, which would have shipped
 * the key in the browser bundle (audit finding B5, 2026-09-08); that path is
 * gone and the UI labels the series as the annual dataset it is.
 *
 * @see https://truflation.com/marketplace/us-inflation-rate
 */
export interface TruflationAnnualPoint {
  year: number;
  truflationCpiYoY: number;
  /** Official BLS CPI YoY for context in tooltips */
  blsCpiYoY?: number;
}

export const TRUFLATION_PEAK_YOY = 11.2;
export const TRUFLATION_PEAK_LABEL = 'Jun 2022';

/** Earliest year with USD M2 inflation in supplyData (optional extended chart). */
export const EXTENDED_HISTORY_START_YEAR = 1960;

/** Annual Truflation US CPI YoY (%). Pre-2022 values use Truflation backtest. */
export const truflationAnnualData: TruflationAnnualPoint[] = [
  { year: 2010, truflationCpiYoY: 1.64, blsCpiYoY: 1.6 },
  { year: 2011, truflationCpiYoY: 3.16, blsCpiYoY: 3.2 },
  { year: 2012, truflationCpiYoY: 2.07, blsCpiYoY: 2.1 },
  { year: 2013, truflationCpiYoY: 1.47, blsCpiYoY: 1.5 },
  { year: 2014, truflationCpiYoY: 1.62, blsCpiYoY: 1.6 },
  { year: 2015, truflationCpiYoY: 0.12, blsCpiYoY: 0.1 },
  { year: 2016, truflationCpiYoY: 1.26, blsCpiYoY: 1.3 },
  { year: 2017, truflationCpiYoY: 2.13, blsCpiYoY: 2.1 },
  { year: 2018, truflationCpiYoY: 2.44, blsCpiYoY: 2.4 },
  { year: 2019, truflationCpiYoY: 1.81, blsCpiYoY: 1.8 },
  { year: 2020, truflationCpiYoY: 2.75, blsCpiYoY: 1.4 },
  { year: 2021, truflationCpiYoY: 7.04, blsCpiYoY: 4.7 },
  { year: 2022, truflationCpiYoY: 7.85, blsCpiYoY: 8.0 },
  { year: 2023, truflationCpiYoY: 3.72, blsCpiYoY: 3.4 },
  { year: 2024, truflationCpiYoY: 2.68, blsCpiYoY: 2.9 },
  { year: 2025, truflationCpiYoY: 3.05, blsCpiYoY: 2.8 },
];

export const TRUFLATION_START_YEAR = truflationAnnualData[0].year;
export const TRUFLATION_END_YEAR =
  truflationAnnualData[truflationAnnualData.length - 1].year;

/** Most recent annual figure in the dataset. */
export const TRUFLATION_LATEST_YOY =
  truflationAnnualData[truflationAnnualData.length - 1].truflationCpiYoY;

/** Honest source label for the UI — no live feed behind this series. */
export const TRUFLATION_SOURCE_LABEL =
  'Truflation US CPI, annual series (static dataset), next to the official BLS CPI';

export function truflationAverageSince(year: number): number {
  const points = truflationAnnualData.filter((p) => p.year >= year);
  if (points.length === 0) return 0;
  return points.reduce((sum, p) => sum + p.truflationCpiYoY, 0) / points.length;
}

export function getTruflationPoint(year: number): TruflationAnnualPoint | undefined {
  return truflationAnnualData.find((p) => p.year === year);
}
