import { useInView } from 'react-intersection-observer';
import { Clock, Layers, TrendingDown } from 'lucide-react';
import { halvingSchedule } from '../data/supplyData';
import { SectionHeader } from './SectionHeader';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function HalvingTimeline() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <section ref={ref} className="section-shell">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="05"
          kickerLabel="Halving"
          align="left"
          inView={inView}
          title={<>The <span className="gradient-text-bitcoin">halving</span> schedule</>}
          subtitle="Every ~4 years, new Bitcoin supply is cut in half. Coded into the protocol permanently."
        />

        <div className="relative pl-0 md:pl-8">
          <div className="absolute bottom-2 left-3 top-2 hidden w-px bg-gradient-to-b from-bitcoin-orange/60 to-transparent md:left-8 md:block" />

          <div className="space-y-5">
            {halvingSchedule.map((halving, index) => {
              const isFuture = new Date(halving.date) > new Date();

              return (
                <div
                  key={halving.date}
                  className={`reveal reveal-left ${inView ? 'reveal-in' : ''} relative md:pl-10`}
                  style={{ transitionDelay: `${index * 0.08}s` }}
                >
                  <div
                    className={`absolute left-0 top-6 hidden h-3 w-3 rounded-full border-2 md:block ${
                      isFuture
                        ? 'border-bok-muted bg-bok-card'
                        : 'border-bitcoin-orange bg-bitcoin-orange'
                    }`}
                  />

                  <div
                    className={`bok-card p-5 sm:p-6 ${isFuture ? 'border-dashed border-bok-muted/50' : ''}`}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2 text-sm tabular-nums text-bok-muted">
                        <Clock className="h-4 w-4" strokeWidth={1.75} />
                        {dateFormatter.format(new Date(halving.date))}
                        {isFuture ? ' (est.)' : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-bitcoin-orange" strokeWidth={1.75} />
                        <span className="text-lg font-bold tabular-nums text-bitcoin-orange">
                          {halving.blockReward} BTC/block
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm tabular-nums text-bok-text">
                      <TrendingDown className="h-4 w-4 text-bok-muted" strokeWidth={1.75} />
                      {halving.totalSupplyAtHalving.toLocaleString('en-US')} BTC mined
                      <span className="text-bok-muted">({halving.inflationRate}% annual)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HalvingTimeline;
