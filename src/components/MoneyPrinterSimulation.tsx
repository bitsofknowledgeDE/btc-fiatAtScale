import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Printer, Pickaxe } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { chartColor } from '../lib/chart-colors';
import { useBtcPrice } from '../context/BtcPriceContext';
import { useBtcNetwork } from '../context/BtcNetworkContext';
import { USD_PRINTED_PER_SECOND } from '../data/supplyData';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface CanvasEmissionConfig {
  originX: number;
  /** Colour as a function of alpha — resolved from the BoK series tokens. */
  color: (alpha: number) => string;
  label: string;
  labelColor: string;
  symbol: string;
  /** USD value emitted per second — drives particle density & speed */
  valuePerSecond: number;
  referenceRate: number;
  onAccumulate: (delta: number) => void;
}

function emissionVisuals(valuePerSecond: number, referenceRate: number) {
  const relative = Math.max(0.04, valuePerSecond / referenceRate);
  return {
    relative,
    spawnEvery: Math.max(1, Math.round(4 / Math.cbrt(relative * 10))),
    burstCount: Math.max(1, Math.round(relative * 16)),
    baseVx: 0.8 + relative * 7,
    ySpread: 6 + relative * 42,
    baseSize: 3 + relative * 8,
    maxParticles: Math.round(40 + relative * 280),
    sourceGlow: relative,
  };
}

function useEmissionCanvas(inView: boolean, config: CanvasEmissionConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (!inView || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (now: number) => {
      const {
        originX,
        color,
        label,
        labelColor,
        symbol,
        valuePerSecond,
        referenceRate,
        onAccumulate,
      } = configRef.current;

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      onAccumulate(valuePerSecond * dt);

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      frameCount++;

      const vis = emissionVisuals(valuePerSecond, referenceRate);

      if (frameCount % vis.spawnEvery === 0 && particlesRef.current.length < vis.maxParticles) {
        for (let i = 0; i < vis.burstCount; i++) {
          particlesRef.current.push({
            x: rect.width * originX + Math.random() * 36 - 18,
            y: rect.height * 0.5 + (Math.random() - 0.5) * vis.ySpread,
            vx: vis.baseVx + Math.random() * (vis.baseVx * 0.5),
            vy: (Math.random() - 0.5) * (1 + vis.relative * 3),
            life: 0,
            maxLife: 80 + Math.random() * (60 + vis.relative * 80),
            size: vis.baseSize + Math.random() * (vis.baseSize * 0.6),
          });
        }
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.015 + (1 - vis.relative) * 0.02;
        p.life++;

        const progress = p.life / p.maxLife;
        const alpha =
          progress < 0.08 ? progress / 0.08 : progress > 0.65 ? (1 - progress) / 0.35 : 1;

        ctx.fillStyle = color(alpha * (0.45 + vis.relative * 0.45));
        ctx.fillRect(p.x, p.y, p.size * (1.6 + vis.relative * 0.8), p.size);

        if (p.size > 4) {
          ctx.fillStyle = chartColor.card(alpha * (0.35 + vis.relative * 0.25));
          ctx.font = `${Math.floor(p.size)}px monospace`;
          ctx.fillText(symbol, p.x + 2, p.y + p.size - 1);
        }

        return p.life < p.maxLife && p.x < rect.width + 20;
      });

      const bx = rect.width * (originX - 0.1);
      const by = rect.height * 0.35;
      const bw = rect.width * 0.12;
      const bh = rect.height * 0.3;

      if (vis.sourceGlow > 0.5) {
        ctx.fillStyle = color(vis.sourceGlow * 0.12);
        ctx.fillRect(bx - 6, by - 6, bw + 12, bh + 12);
      }

      ctx.fillStyle = chartColor.grid();
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = vis.relative > 0.5 ? color(1) : chartColor.axis();
      ctx.lineWidth = vis.relative > 0.5 ? 2.5 : 1.5;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = labelColor;
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, bx + bw / 2, by + bh / 2 + 4);

      const meterW = bw;
      const meterH = 4;
      const meterX = bx;
      const meterY = by + bh + 8;
      ctx.fillStyle = chartColor.grid();
      ctx.fillRect(meterX, meterY, meterW, meterH);
      ctx.fillStyle = labelColor;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(meterX, meterY, meterW * Math.min(1, vis.relative), meterH);
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
      particlesRef.current = [];
    };
  }, [inView]);

  return canvasRef;
}

export function MoneyPrinterSimulation() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const { btcPriceUsd, isLivePrice } = useBtcPrice();
  const { emission } = useBtcNetwork();
  const satValueUsd = btcPriceUsd / 100_000_000;
  const btcUsdPerSecond = emission.satsPerSecond * satValueUsd;

  const emissionRatio = useMemo(
    () => (btcUsdPerSecond > 0 ? USD_PRINTED_PER_SECOND / btcUsdPerSecond : 0),
    [btcUsdPerSecond],
  );

  const [sessionUsd, setSessionUsd] = useState(0);
  const [sessionSats, setSessionSats] = useState(0);
  const sessionUsdRef = useRef(0);
  const sessionSatsRef = useRef(0);

  const usdCanvasRef = useEmissionCanvas(inView, {
    originX: 0.15,
    color: (alpha) => chartColor.fiat(alpha),
    label: 'FED',
    labelColor: chartColor.axis(),
    symbol: '$',
    valuePerSecond: USD_PRINTED_PER_SECOND,
    referenceRate: USD_PRINTED_PER_SECOND,
    onAccumulate: (delta) => {
      sessionUsdRef.current += delta;
      if (Math.floor(sessionUsdRef.current) !== Math.floor(sessionUsdRef.current - delta)) {
        setSessionUsd(sessionUsdRef.current);
      }
    },
  });

  const satCanvasRef = useEmissionCanvas(inView, {
    originX: 0.15,
    color: (alpha) => chartColor.bitcoin(alpha),
    label: 'MINER',
    labelColor: chartColor.bitcoin(),
    symbol: '₿',
    valuePerSecond: btcUsdPerSecond,
    referenceRate: USD_PRINTED_PER_SECOND,
    onAccumulate: (delta) => {
      const satsDelta = delta / satValueUsd || 0;
      sessionSatsRef.current += satsDelta;
      if (Math.floor(sessionSatsRef.current) !== Math.floor(sessionSatsRef.current - satsDelta)) {
        setSessionSats(sessionSatsRef.current);
      }
    },
  });

  useEffect(() => {
    if (!inView) return;
    const sync = setInterval(() => {
      setSessionUsd(sessionUsdRef.current);
      setSessionSats(sessionSatsRef.current);
    }, 250);
    return () => clearInterval(sync);
  }, [inView]);

  const satUSDValue = sessionSats * satValueUsd;

  return (
    <section ref={ref} className="section-shell bg-bok-surface">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          kicker="02"
          kickerLabel="Emission"
          align="center"
          inView={inView}
          id="emission-heading"
          title={<>Emission <span className="gradient-text-fiat">compared</span></>}
          subtitle="Both sides emit value in real time, but only one of them has a hard limit."
        />

        {isLivePrice && emissionRatio > 0 && (
          <p
            className={`reveal ${inView ? 'reveal-in' : ''} mb-6 text-center text-sm text-bok-muted`}
          >
            At ${Math.round(btcPriceUsd).toLocaleString('en-US')}/BTC, the Fed emits{' '}
            <span className="font-semibold tabular-nums text-series-3">
              {emissionRatio.toFixed(1)}×
            </span>{' '}
            more USD value per second than miners
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div
            className={`reveal reveal-left ${inView ? 'reveal-in' : ''} bok-card relative p-5 sm:p-6`}
          >
            <div className="absolute left-0 top-0 h-0.5 w-full rounded-t-2xl bg-series-3" />
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-series-3">USD, Federal Reserve</p>
                <p className="mt-0.5 text-sm tabular-nums text-bok-muted">
                  +${USD_PRINTED_PER_SECOND.toLocaleString('en-US')}/sec, no supply cap
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-series-3/20 bg-series-3/10">
                <Printer className="h-4 w-4 text-series-3" strokeWidth={1.75} />
              </div>
            </div>
            <canvas ref={usdCanvasRef} className="h-[200px] w-full rounded-xl sm:h-[240px]" />
            <div className="mt-3 flex items-end justify-between">
              <p className="text-xs text-bok-muted">This session</p>
              <p className="text-xl font-bold tabular-nums text-series-3">
                ${Math.floor(sessionUsd).toLocaleString('en-US')}
              </p>
            </div>
          </div>

          <div
            className={`reveal reveal-right ${inView ? 'reveal-in' : ''} bok-card relative p-5 sm:p-6`}
            style={{ transitionDelay: '0.1s' }}
          >
            <div className="absolute left-0 top-0 h-0.5 w-full rounded-t-2xl bg-bitcoin-orange" />
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-bitcoin-orange">BTC, protocol emission</p>
                <p className="mt-0.5 text-sm tabular-nums text-bok-muted">
                  ~{Math.round(emission.satsPerSecond).toLocaleString('en-US')} sats/sec, 21M cap
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-bitcoin-orange/20 bg-bitcoin-orange/10">
                <Pickaxe className="h-4 w-4 text-bitcoin-orange" strokeWidth={1.75} />
              </div>
            </div>
            <canvas ref={satCanvasRef} className="h-[200px] w-full rounded-xl sm:h-[240px]" />
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-bok-muted">Sats emitted</p>
                <p className="text-lg font-bold tabular-nums text-bitcoin-orange">
                  {Math.floor(sessionSats).toLocaleString('en-US')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs tabular-nums text-bok-muted">
                  {isLivePrice
                    ? `@$${Math.round(btcPriceUsd).toLocaleString('en-US')}/BTC`
                    : 'Live price unavailable'}
                </p>
                <p className="text-xl font-bold tabular-nums text-bitcoin-orange">
                  {isLivePrice
                    ? `$${satUSDValue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`reveal ${inView ? 'reveal-in' : ''} mt-5 grid grid-cols-1 gap-4 text-center sm:grid-cols-3 sm:text-left`}
          style={{ transitionDelay: '0.2s' }}
        >
          <div className="bok-card p-4">
            <p className="mb-1 text-sm text-bok-muted">USD rate</p>
            <p className="data-metric text-series-3">
              +${USD_PRINTED_PER_SECOND.toLocaleString('en-US')}/sec
            </p>
          </div>
          <div className="bok-card flex flex-col items-center justify-center gap-1 p-4">
            <p className="text-xl font-light text-bok-muted">vs</p>
            {isLivePrice && emissionRatio > 0 && (
              <p className="text-xs tabular-nums text-series-3">
                {emissionRatio.toFixed(1)}× gap
              </p>
            )}
          </div>
          <div className="bok-card p-4 sm:text-right">
            <p className="mb-1 text-sm text-bok-muted">BTC rate (post-halving)</p>
            <p className="data-metric text-bitcoin-orange">
              {isLivePrice ? `~$${btcUsdPerSecond.toFixed(2)}/sec` : '—'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MoneyPrinterSimulation;
