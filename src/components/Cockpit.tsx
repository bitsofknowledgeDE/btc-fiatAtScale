import { useMemo, useState } from 'react';
import { Bitcoin, Printer, RotateCcw } from 'lucide-react';
import ShareOnX from '../../../../CI/web/ShareOnX';
import { BokDataNotice } from '../../../../CI/web/BokDataNotice';
import SliderInput from './SliderInput';
import { SupplyScaleChart } from './SupplyScaleChart';
import { useLiveRace } from '../context/LiveRaceContext';
import { useBtcNetwork } from '../context/BtcNetworkContext';
import { useBtcPrice } from '../context/BtcPriceContext';
import {
  BITCOIN_MAX_SUPPLY,
  DEFAULT_M2_GROWTH_PCT,
  HISTORY_START_YEAR,
  LATEST_REPORTED_YEAR,
  SUPPLY_TABLE_END_YEAR,
  USD_PRINTED_PER_SECOND,
  btcSupplyMillionsAt,
  m2TrillionsAt,
} from '../data/supplyData';

const DEFAULT_START_YEAR = 1971;
const MAX_START_YEAR = 2015;
const BTC_CAP_MILLIONS = BITCOIN_MAX_SUPPLY / 1e6;

function formatTrillions(value: number): string {
  if (value >= 100) return `$${Math.round(value).toLocaleString('en-US')}T`;
  if (value >= 10) return `$${value.toFixed(0)}T`;
  return `$${value.toFixed(1)}T`;
}

/** Money supply per bitcoin, written the way people read it: $1.24M. */
function formatPerCoin(usd: number): string {
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
  if (usd >= 1e3) return `$${Math.round(usd).toLocaleString('en-US')}`;
  return `$${usd.toFixed(2)}`;
}

export function Cockpit() {
  const [startYear, setStartYear] = useState(DEFAULT_START_YEAR);
  const [horizon, setHorizon] = useState(SUPPLY_TABLE_END_YEAR);
  const [growth, setGrowth] = useState(DEFAULT_M2_GROWTH_PCT);

  const { emission } = useBtcNetwork();
  const { loading: priceLoading, refetch: refetchPrice } = useBtcPrice();
  const {
    elapsed,
    btcMined,
    ratio,
    priceAvailable,
    btcPriceUsd,
    usdPrintedSinceLoad,
    formatUsd,
    counterAnchorRef,
  } = useLiveRace();

  const scenario = useMemo(() => {
    const m2Now = m2TrillionsAt(LATEST_REPORTED_YEAR, growth);
    const m2Then = m2TrillionsAt(horizon, growth);
    const btcNow = btcSupplyMillionsAt(LATEST_REPORTED_YEAR);
    const btcThen = btcSupplyMillionsAt(horizon);
    return {
      m2Now,
      m2Then,
      btcNow,
      btcThen,
      multiple: m2Then / m2Now,
      perCoinNow: (m2Now * 1e12) / (btcNow * 1e6),
      perCoinThen: (m2Then * 1e12) / (btcThen * 1e6),
      capShare: (btcThen / BTC_CAP_MILLIONS) * 100,
    };
  }, [growth, horizon]);

  const isDefault =
    startYear === DEFAULT_START_YEAR &&
    horizon === SUPPLY_TABLE_END_YEAR &&
    growth === DEFAULT_M2_GROWTH_PCT;

  const reset = () => {
    setStartYear(DEFAULT_START_YEAR);
    setHorizon(SUPPLY_TABLE_END_YEAR);
    setGrowth(DEFAULT_M2_GROWTH_PCT);
  };

  const shareText =
    `By ${horizon} US M2 reaches ${formatTrillions(scenario.m2Then)} at ${growth}%/yr while Bitcoin stays capped at 21M coins — ` +
    `${formatPerCoin(scenario.perCoinThen)} of money supply per bitcoin, ${scenario.multiple.toFixed(1)}x today. ` +
    `fiatatscale.com @BitsKnowledgeDE #Bitcoin`;

  const stats = [
    {
      label: `USD M2 in ${horizon}`,
      value: formatTrillions(scenario.m2Then),
      sub: `${scenario.multiple.toFixed(1)}× today's ${formatTrillions(scenario.m2Now)}`,
      tone: 'fiat' as const,
    },
    {
      label: `Bitcoin supply in ${horizon}`,
      value: `${scenario.btcThen.toFixed(2)}M`,
      sub: `${scenario.capShare.toFixed(1)}% of the 21M cap`,
      tone: 'bitcoin' as const,
    },
    {
      label: `M2 per bitcoin in ${horizon}`,
      value: formatPerCoin(scenario.perCoinThen),
      sub: `today ${formatPerCoin(scenario.perCoinNow)}`,
      tone: 'neutral' as const,
    },
  ];

  return (
    <section
      aria-labelledby="cockpit-heading"
      className="px-4 pb-10 pt-6 sm:pt-8"
      id="cockpit"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[40fr_60fr] lg:grid-rows-[auto_1fr] lg:gap-8">
        {/* Promise */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <p className="section-kicker">
            <span className="num">01</span>
            <span className="label">Money supply vs 21 million</span>
          </p>
          <h1
            id="cockpit-heading"
            className="text-balance font-heading text-3xl font-extrabold leading-[1.08] tracking-tight text-bok-text sm:text-4xl lg:text-[2.5rem]"
          >
            See how far the dollar supply runs ahead of Bitcoin&rsquo;s fixed{' '}
            <span className="text-bitcoin-orange">21 million</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-bok-muted">
            Set the window and the annual growth rate for the dollar side — the chart and the
            numbers update as you drag.
          </p>
        </div>

        {/* Key visual + key numbers */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div className="bok-card p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="flex items-center gap-2 text-xs text-bok-text sm:text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-series-3" />
                USD M2
              </span>
              <span className="flex items-center gap-2 text-xs text-bok-text sm:text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-bitcoin-orange" />
                Bitcoin supply
              </span>
              <span className="flex items-center gap-2 text-xs text-bok-muted sm:text-sm">
                <span className="h-0.5 w-4 border-t-2 border-dashed border-bok-muted" />
                Scenario
              </span>
            </div>

            <SupplyScaleChart startYear={startYear} endYear={horizon} growthPct={growth} />

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-bok-border pt-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs text-bok-muted">{stat.label}</p>
                  <p
                    className={`data-metric ${
                      stat.tone === 'fiat'
                        ? 'text-series-3'
                        : stat.tone === 'bitcoin'
                          ? 'text-bitcoin-orange'
                          : 'text-bok-text'
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-bok-muted">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Share sits at the main result, not in the legend row (§10.5). */}
            <div className="mt-4 flex justify-start sm:justify-end">
              <ShareOnX
                text={shareText}
                card={{
                  headline: `How much money supply exists per bitcoin in ${horizon}?`,
                  statValue: `${formatPerCoin(scenario.perCoinThen)} per BTC`,
                  statLabel: `US M2 per bitcoin in ${horizon}, at ${growth}% M2 growth per year`,
                  subItems: [
                    { label: `USD M2 in ${horizon}`, value: formatTrillions(scenario.m2Then) },
                    { label: 'Bitcoin supply', value: `${scenario.btcThen.toFixed(2)}M BTC` },
                    { label: 'Versus today', value: `${scenario.multiple.toFixed(1)}× the M2` },
                  ],
                  domain: 'fiatatscale.com',
                }}
              />
            </div>
          </div>
        </div>

        {/* Controls + live counter */}
        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2 lg:self-start">
          <div className="bok-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-bok-muted">
                Your scenario
              </h2>
              {!isDefault && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-bok-border px-2.5 py-1 text-xs font-semibold text-bok-muted transition-colors hover:border-bitcoin-orange/30 hover:text-bitcoin-orange"
                >
                  <RotateCcw className="h-3 w-3" strokeWidth={2} />
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-4">
              <SliderInput
                label="Chart starts in"
                value={startYear}
                onChange={(v) => setStartYear(Math.min(Math.round(v), horizon - 5))}
                min={HISTORY_START_YEAR}
                max={MAX_START_YEAR}
                step={1}
              />
              <SliderInput
                label="Horizon"
                value={horizon}
                onChange={(v) => setHorizon(Math.max(Math.round(v), startYear + 5))}
                min={LATEST_REPORTED_YEAR + 1}
                max={SUPPLY_TABLE_END_YEAR}
                step={1}
                readout={`${horizon - LATEST_REPORTED_YEAR} years out`}
              />
              <SliderInput
                label="USD M2 growth"
                value={growth}
                onChange={setGrowth}
                min={0}
                max={12}
                step={0.1}
                suffix="%/yr"
                fieldWidth="w-16"
                hint={`The dataset's own long-range path implies ${DEFAULT_M2_GROWTH_PCT}% per year. Bitcoin's side is not a scenario — it is the protocol schedule.`}
              />
            </div>
          </div>

          <div ref={counterAnchorRef} className="bok-card p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-bok-muted">
                Since you opened this page
              </h2>
              <span className="text-xs tabular-nums text-bok-muted">{elapsed}s</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-series-3">
                  <Printer className="h-3.5 w-3.5" strokeWidth={1.75} />
                  USD printed
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-series-3 sm:text-2xl">
                  ${formatUsd(usdPrintedSinceLoad)}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-bok-muted">
                  +${USD_PRINTED_PER_SECOND.toLocaleString('en-US')}/sec
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-bitcoin-orange">
                  <Bitcoin className="h-3.5 w-3.5" strokeWidth={1.75} />
                  BTC mined
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-bitcoin-orange sm:text-2xl">
                  {btcMined.toFixed(6)}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-bok-muted">
                  ~{Math.round(emission.satsPerSecond).toLocaleString('en-US')} sats/sec
                </p>
              </div>
            </div>

            {priceAvailable ? (
              <p className="mt-3 border-t border-bok-border pt-3 text-sm text-bok-text">
                <span className="font-bold tabular-nums text-series-3">
                  {ratio > 0 ? `${ratio.toLocaleString('en-US')}×` : '—'}
                </span>{' '}
                more USD printed than BTC mined, measured in bitcoin at $
                {Math.round(btcPriceUsd).toLocaleString('en-US')}
              </p>
            ) : priceLoading ? (
              <p className="mt-3 border-t border-bok-border pt-3 text-sm text-bok-muted">
                Loading the live bitcoin price…
              </p>
            ) : (
              <BokDataNotice lang="en" onRetry={refetchPrice}>
                <p style={{ margin: 0 }}>
                  The live bitcoin price is not reachable right now, so the BTC-equivalent
                  comparison is hidden rather than shown with an old price. The dollar and
                  bitcoin counters above are unaffected.
                </p>
              </BokDataNotice>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cockpit;
