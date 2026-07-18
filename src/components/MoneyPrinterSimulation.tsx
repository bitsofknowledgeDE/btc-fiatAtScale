import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Printer, Pickaxe } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
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
  color: string;
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

        ctx.fillStyle = `${color}${Math.round(alpha * (0.45 + vis.relative * 0.45) * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.fillRect(p.x, p.y, p.size * (1.6 + vis.relative * 0.8), p.size);

        if (p.size > 4) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * (0.35 + vis.relative * 0.25)})`;
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
        ctx.fillStyle = `${color}${Math.round(vis.sourceGlow * 0.12 * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.fillRect(bx - 6, by - 6, bw + 12, bh + 12);
      }

      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = vis.relative > 0.5 ? '#16865A' : '#94A3B8';
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
      ctx.fillStyle = '#CBD5E1';
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
  const { btcPriceUsd } = useBtcPrice();
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
    color: 'rgba(22, 134, 90, ',
    label: 'FED',
    labelColor: '#475569',
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
    color: 'rgba(247, 147, 26, ',
    label: 'MINER',
    labelColor: '#F7931A',
    symbol: '₿',
    valuePerSecond: btcUsdPerSecond,
    referenceRate: USD_PRINTED_PER_SECOND,
    onAccumulate: (delta) => {
      const satsDelta = (delta / satValueUsd) || 0;
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
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          kicker="02"
          kickerLabel="Emission"
          align="center"
          inView={inView}
          title={<>Emission <span className="gradient-text-fiat">compared</span></>}
          subtitle="Both emit value in real time, but only one has a hard limit."
        />

        {emissionRatio > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mb-6 text-center text-sm text-bok-muted"
          >
            At ${btcPriceUsd.toLocaleString()}/BTC, the Fed emits{' '}
            <span className="font-mono font-semibold text-emerald-700">
              {emissionRatio.toFixed(1)}×
            </span>{' '}
            more USD value per second than miners
          </motion.p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-card p-5 sm:p-6 relative"
          >
            <div className="absolute left-0 top-0 h-0.5 w-full rounded-t-2xl bg-emerald-600" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-emerald-700">USD, Federal Reserve</p>
                <p className="mt-0.5 text-sm text-bok-muted">
                  +${USD_PRINTED_PER_SECOND.toLocaleString()}/sec, no supply cap
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-600/20 bg-emerald-600/10">
                <Printer className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
              </div>
            </div>
            <canvas ref={usdCanvasRef} className="w-full h-[200px] sm:h-[240px] rounded-xl" />
            <div className="mt-3 flex items-end justify-between">
              <p className="text-xs text-bok-muted">This session</p>
              <p className="font-mono text-xl font-bold text-emerald-700">
                ${Math.floor(sessionUsd).toLocaleString()}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-card p-5 sm:p-6 relative"
          >
            <div className="absolute left-0 top-0 h-0.5 w-full rounded-t-2xl bg-bitcoin-orange" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-bitcoin-orange">BTC, protocol emission</p>
                <p className="mt-0.5 text-sm text-bok-muted">
                  ~{Math.round(emission.satsPerSecond).toLocaleString()} sats/sec, 21M cap
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-bitcoin-orange/20 bg-bitcoin-orange/10">
                <Pickaxe className="h-4 w-4 text-bitcoin-orange" strokeWidth={1.75} />
              </div>
            </div>
            <canvas ref={satCanvasRef} className="w-full h-[200px] sm:h-[240px] rounded-xl opacity-95" />
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-bok-muted">Sats emitted</p>
                <p className="font-mono text-lg font-bold text-bitcoin-orange">
                  {Math.floor(sessionSats).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-bok-muted">@${btcPriceUsd.toLocaleString()}/BTC</p>
                <p className="font-mono text-xl font-bold text-bitcoin-orange">
                  ${satUSDValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left"
        >
          <div className="glass-card p-4">
            <p className="mb-1 text-sm text-bok-muted">USD rate</p>
            <p className="data-metric text-emerald-700">+${USD_PRINTED_PER_SECOND.toLocaleString()}/sec</p>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center gap-1">
            <p className="text-xl font-light text-bok-muted">vs</p>
            {emissionRatio > 0 && (
              <p className="font-mono text-xs text-emerald-700">{emissionRatio.toFixed(1)}× gap</p>
            )}
          </div>
          <div className="glass-card p-4 sm:text-right">
            <p className="mb-1 text-sm text-bok-muted">BTC rate (post-halving)</p>
            <p className="data-metric text-bitcoin-orange">~${btcUsdPerSecond.toFixed(2)}/sec</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
