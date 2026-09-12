import { useInView } from 'react-intersection-observer';
import { DollarSign, Bitcoin, Printer, Lock, TrendingUp, Shield } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { truflationAverageSince } from '../data/truflationInflation';
import {
  LATEST_REPORTED_YEAR,
  SUPPLY_TABLE_END_YEAR,
  btcSupplyMillionsAt,
  getLatestBtcSupplyInflationYoY,
  reportedM2Trillions,
  supplyData,
} from '../data/supplyData';

/* Every figure below is derived from the datasets, so none of them can go
   stale in copy (WP-6, decision 2026-09-08). */
const SINCE_YEAR = 2020;
const avgTruflationSince = truflationAverageSince(SINCE_YEAR);
const m2GrowthSincePct =
  (reportedM2Trillions(LATEST_REPORTED_YEAR) / reportedM2Trillions(SINCE_YEAR) - 1) * 100;
const btcGrowthSincePct =
  (btcSupplyMillionsAt(LATEST_REPORTED_YEAR) / btcSupplyMillionsAt(SINCE_YEAR) - 1) * 100;
const btcIssuanceYoY = getLatestBtcSupplyInflationYoY();
const longRangeM2Trillions =
  supplyData.find((d) => d.year === SUPPLY_TABLE_END_YEAR)?.usdM2Trillions ?? 0;
const longRangeBtcMillions = btcSupplyMillionsAt(SUPPLY_TABLE_END_YEAR);

const comparisons = [
  {
    category: 'Supply control',
    usd: { icon: Printer, label: 'Central banks can print unlimited amounts', value: 'Unlimited' },
    btc: { icon: Lock, label: 'Hardcoded cap in the protocol', value: '21,000,000' },
  },
  {
    category: 'Inflation model',
    usd: {
      icon: TrendingUp,
      label: 'Truflation CPI — independent index',
      value: `~${avgTruflationSince.toFixed(1)}% avg/yr since ${SINCE_YEAR}`,
    },
    btc: {
      icon: Shield,
      label: 'Issuance halves every four years',
      value: `${btcIssuanceYoY.toFixed(2)}%/yr`,
    },
  },
  {
    category: `Supply since ${SINCE_YEAR}`,
    usd: {
      icon: DollarSign,
      label: `USD M2 grew through ${LATEST_REPORTED_YEAR}`,
      value: `+${m2GrowthSincePct.toFixed(1)}%`,
    },
    btc: {
      icon: Bitcoin,
      label: 'Mined on schedule, no exceptions',
      value: `+${btcGrowthSincePct.toFixed(1)}%`,
    },
  },
  {
    category: `Scenario to ${SUPPLY_TABLE_END_YEAR}`,
    usd: {
      icon: DollarSign,
      label: 'Compounding continues at the trend rate',
      value: `$${longRangeM2Trillions.toFixed(0)}T M2`,
    },
    btc: {
      icon: Bitcoin,
      label: 'Approaches the final supply',
      value: `~${longRangeBtcMillions.toFixed(2)}M BTC`,
    },
  },
];

export function ComparisonTable() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section ref={ref} className="section-shell">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="06"
          kickerLabel="Comparison"
          align="center"
          inView={inView}
          title={<>Side by <span className="text-bok-text">side</span></>}
          subtitle="Two monetary systems with fundamentally different approaches to supply."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {comparisons.map((comp, index) => (
            <article
              key={comp.category}
              className={`reveal ${inView ? 'reveal-in' : ''} bok-card flex flex-col gap-4 p-5 sm:p-6`}
              style={{ transitionDelay: `${index * 0.08}s` }}
            >
              <h3 className="text-base font-semibold text-bok-text">{comp.category}</h3>

              <div className="compare-cell flex items-center gap-4 border-series-3/30 bg-series-3/10">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-series-3/10">
                  <comp.usd.icon className="h-5 w-5 text-series-3" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold tabular-nums text-series-3">{comp.usd.value}</p>
                  <p className="mt-0.5 text-xs text-bok-muted">{comp.usd.label}</p>
                </div>
              </div>

              <div className="compare-cell flex items-center gap-4 border-bitcoin-orange/30 bg-bitcoin-orange/10">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-bitcoin-orange/10">
                  <comp.btc.icon className="h-5 w-5 text-bitcoin-orange" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold tabular-nums text-bitcoin-orange">
                    {comp.btc.value}
                  </p>
                  <p className="mt-0.5 text-xs text-bok-muted">{comp.btc.label}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ComparisonTable;
