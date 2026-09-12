import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useCountUp } from '../hooks/useCountUp';
import { SectionHeader } from './SectionHeader';
import { useBtcNetwork } from '../context/BtcNetworkContext';
import {
  BITCOIN_MAX_SUPPLY,
  USD_PRINTED_PER_SECOND,
  formatBTC,
} from '../data/supplyData';

function formatBtcRate(btc: number): string {
  if (btc >= 1) return formatBTC(btc);
  if (btc >= 0.001) return `${btc.toFixed(5).replace(/0+$/, '').replace(/\.$/, '')} BTC`;
  return `${btc.toFixed(8).replace(/0+$/, '').replace(/\.$/, '')} BTC`;
}

function formatUsdRate(usdPerSecond: number): string {
  return `$${Math.round(usdPerSecond).toLocaleString('en-US')}`;
}

function formatUsdDaily(usdPerSecond: number): string {
  const daily = usdPerSecond * 86_400;
  if (daily >= 1e12) return `$${(daily / 1e12).toFixed(1)} trillion printed`;
  if (daily >= 1e9) return `$${Math.round(daily / 1e9).toLocaleString('en-US')} billion printed`;
  return `$${Math.round(daily).toLocaleString('en-US')} printed`;
}

/**
 * Dot grid. The count-up already reveals the dots over time, so each dot only
 * needs the one-shot `.pop-in` CSS animation — the old per-dot framer-motion
 * `motion.div` carried the whole motion library for a scale-in (WP-2.4).
 */
function DotGrid({
  count,
  color,
  maxDisplay,
}: {
  count: number;
  color: 'fiat' | 'bitcoin';
  maxDisplay: number;
}) {
  const displayed = Math.min(count, maxDisplay);
  const dotClass = color === 'fiat' ? 'bg-series-3' : 'bg-bitcoin-orange';
  const textClass = color === 'fiat' ? 'text-series-3' : 'text-bitcoin-orange';

  return (
    <div className="flex max-h-[180px] flex-wrap justify-start gap-[3px] overflow-hidden">
      {Array.from({ length: displayed }).map((_, i) => (
        <span key={i} className={`pop-in h-[5px] w-[5px] rounded-full opacity-85 ${dotClass}`} />
      ))}
      {count > maxDisplay && (
        <span className={`mt-2 w-full text-xs tabular-nums ${textClass}`}>
          +{(count - maxDisplay).toLocaleString('en-US')} more
        </span>
      )}
    </div>
  );
}

export function ScaleVisualization() {
  const [activeScale, setActiveScale] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });
  const { emission } = useBtcNetwork();

  const scales = useMemo(() => {
    const yearlyPctOfMax = ((emission.btcPerYear / BITCOIN_MAX_SUPPLY) * 100).toFixed(2);

    return [
      {
        id: 'seconds',
        title: 'Every second',
        usdLabel: `${formatUsdRate(USD_PRINTED_PER_SECOND)} printed`,
        btcLabel: `${formatBtcRate(emission.btcPerSecond)} mined`,
        usdDots: Math.round(USD_PRINTED_PER_SECOND / 100),
        btcDots: Math.max(1, Math.round(emission.btcPerSecond * 100_000)),
        description: `The US creates ${formatUsdRate(USD_PRINTED_PER_SECOND)} every second. Miners find about ${formatBtcRate(emission.btcPerSecond)}.`,
      },
      {
        id: 'daily',
        title: 'Every day',
        usdLabel: formatUsdDaily(USD_PRINTED_PER_SECOND),
        btcLabel: `${Math.round(emission.btcPerDay).toLocaleString('en-US')} BTC mined`,
        usdDots: 3000,
        btcDots: Math.max(1, Math.round(emission.btcPerDay / 90)),
        description: `${formatUsdDaily(USD_PRINTED_PER_SECOND)} versus ${Math.round(emission.btcPerDay).toLocaleString('en-US')} new Bitcoin.`,
      },
      {
        id: 'yearly',
        title: 'Every year',
        usdLabel: '$1+ trillion printed',
        btcLabel: `${Math.round(emission.btcPerYear).toLocaleString('en-US')} BTC mined`,
        usdDots: 10000,
        btcDots: Math.max(1, Math.round(emission.btcPerYear / 10_000)),
        description: `Over $1 trillion new dollars per year. Bitcoin adds ${Math.round(emission.btcPerYear).toLocaleString('en-US')} coins (${yearlyPctOfMax}% of max).`,
      },
    ];
  }, [emission]);

  const scale = scales[activeScale];
  const usdCount = useCountUp(scale.usdDots, 1500, 0, inView);
  const btcCount = useCountUp(scale.btcDots, 1500, 0, inView);

  return (
    <section ref={ref} className="section-shell">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="03"
          kickerLabel="Scale"
          align="left"
          inView={inView}
          title={<>Feeling the <span className="gradient-text-fiat">scale</span></>}
          subtitle="Each dot is value created. Compare USD printing density to Bitcoin mining."
        />

        <div className="mb-10 flex flex-wrap gap-2">
          {scales.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveScale(i)}
              className={`pill-button ${activeScale === i ? 'pill-button-active' : 'pill-button-inactive'}`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div key={scale.id} className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="bok-card relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-series-3/10 to-transparent" />
            <div className="relative">
              <h3 className="mb-1 text-xl font-bold text-series-3">{scale.usdLabel}</h3>
              <p className="mb-6 text-sm text-bok-muted">US Dollar</p>
              <DotGrid count={Math.floor(usdCount)} color="fiat" maxDisplay={500} />
            </div>
          </div>

          <div className="bok-card relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-bitcoin-orange/10 to-transparent" />
            <div className="relative">
              <h3 className="mb-1 text-xl font-bold text-bitcoin-orange">{scale.btcLabel}</h3>
              <p className="mb-6 text-sm text-bok-muted">Bitcoin</p>
              <DotGrid count={Math.floor(btcCount)} color="bitcoin" maxDisplay={500} />
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-bok-text">{scale.description}</p>
      </div>
    </section>
  );
}

export default ScaleVisualization;
