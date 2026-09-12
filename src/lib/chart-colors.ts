/**
 * Chart colours from the BoK tokens.
 *
 * SVG/canvas drawing needs a concrete colour string — recharts passes `stroke`
 * and `fill` straight through, and a 2D canvas cannot resolve `var()` at all.
 * So the RGB triples from CI/web/bok-tokens.css are read once through
 * getComputedStyle and turned into `rgb()` / `rgba()` — the same approach
 * CI/web/shareCard.ts documents. No chart colour is hard-coded in this site.
 *
 * Series assignment (CI/web/bok-tokens.css, decision 2026-09-08):
 *   series-1 = bitcoin orange  -> the Bitcoin series
 *   series-2 = teal            -> the BTC dollar-price series
 *   series-3 = emerald         -> the USD M2 / fiat series
 */

/** Fallbacks as RGB triples (no hex in this repo's site code) for the case
 *  where the stylesheet has not been applied yet. */
const FALLBACKS: Record<string, string> = {
  '--bitcoin-orange': '247 147 26',
  '--bok-series-1': '247 147 26',
  '--bok-series-2': '11 150 166',
  '--bok-series-3': '16 185 129',
  '--bok-series-6': '100 116 139',
  '--bok-text': '15 23 42',
  '--bok-muted': '100 116 139',
  '--bok-border': '226 232 240',
  '--bok-surface': '244 246 250',
  '--bok-card-bg': '255 255 255',
};

const cache = new Map<string, string>();

function triple(name: string): string {
  const cached = cache.get(name);
  if (cached) return cached;
  let value = '';
  try {
    value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  } catch {
    value = '';
  }
  const resolved = value || FALLBACKS[name] || '0 0 0';
  if (value) cache.set(name, resolved);
  return resolved;
}

/** `rgb()` / `rgba()` string for a BoK token. */
export function tokenColor(name: string, alpha = 1): string {
  const [r, g, b] = triple(name).split(/[\s,]+/);
  return alpha >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Named roles used across this site's charts. */
export const chartColor = {
  /** USD M2 / fiat series */
  fiat: (alpha = 1) => tokenColor('--bok-series-3', alpha),
  /** Bitcoin supply series */
  bitcoin: (alpha = 1) => tokenColor('--bok-series-1', alpha),
  /** Bitcoin dollar price series */
  price: (alpha = 1) => tokenColor('--bok-series-2', alpha),
  grid: (alpha = 1) => tokenColor('--bok-border', alpha),
  axis: (alpha = 1) => tokenColor('--bok-muted', alpha),
  text: (alpha = 1) => tokenColor('--bok-text', alpha),
  card: (alpha = 1) => tokenColor('--bok-card-bg', alpha),
  surface: (alpha = 1) => tokenColor('--bok-surface', alpha),
};
