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

      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = vis.relative > 0.5 ? '#6fcf97' : '#486581';
      ctx.lineWidth = vis.relative > 0.5 ? 2.5 : 1.5;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = labelColor;
      ctx.font = '11px Geist Sans, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, bx + bw / 2, by + bh / 2 + 4);

      const meterW = bw;
      const meterH = 4;
      const meterX = bx;
      const meterY = by + bh + 8;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
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
    color: 'rgba(76, 175, 80, ',
    label: 'FED',
    labelColor: '#9fb3c8',
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
    labelColor: '#f7931a',
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
    <section ref={ref} className="section-shell bg-midnight-900/15">
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
            className="text-center text-sm text-midnight-400 mb-6"
          >
            At ${btcPriceUsd.toLocaleString()}/BTC, the Fed emits{' '}
            <span className="font-mono font-semibold text-fiat-400">
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
            <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl bg-gradient-to-r from-fiat-600 to-fiat-400" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-fiat-300">USD, Federal Reserve</p>
                <p className="text-sm text-midnight-500 mt-0.5">
                  +${USD_PRINTED_PER_SECOND.toLocaleString()}/sec, no supply cap
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-fiat-500/10 border border-fiat-500/20 flex items-center justify-center">
                <Printer className="w-4 h-4 text-fiat-400" strokeWidth={1.75} />
              </div>
            </div>
            <canvas ref={usdCanvasRef} className="w-full h-[200px] sm:h-[240px] rounded-xl" />
            <div className="mt-3 flex items-end justify-between">
              <p className="text-xs text-midnight-500">This session</p>
              <p className="text-xl font-mono font-bold text-fiat-400">
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
            <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-2xl bg-gradient-to-r from-bitcoin-600 to-bitcoin-400" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-bitcoin-300">BTC, protocol emission</p>
                <p className="text-sm text-midnight-500 mt-0.5">
                  ~{Math.round(emission.satsPerSecond).toLocaleString()} sats/sec, 21M cap
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-bitcoin-500/10 border border-bitcoin-500/20 flex items-center justify-center">
                <Pickaxe className="w-4 h-4 text-bitcoin-400" strokeWidth={1.75} />
              </div>
            </div>
            <canvas ref={satCanvasRef} className="w-full h-[200px] sm:h-[240px] rounded-xl opacity-95" />
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-midnight-500">Sats emitted</p>
                <p className="text-lg font-mono font-bold text-bitcoin-400">
                  {Math.floor(sessionSats).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-midnight-500">@${btcPriceUsd.toLocaleString()}/BTC</p>
                <p className="text-xl font-mono font-bold text-bitcoin-300">
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
            <p className="text-sm text-midnight-400 mb-1">USD rate</p>
            <p className="data-metric text-fiat-400">+${USD_PRINTED_PER_SECOND.toLocaleString()}/sec</p>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center gap-1">
            <p className="text-xl font-light text-midnight-500">vs</p>
            {emissionRatio > 0 && (
              <p className="text-xs font-mono text-fiat-400/80">{emissionRatio.toFixed(1)}× gap</p>
            )}
          </div>
          <div className="glass-card p-4 sm:text-right">
            <p className="text-sm text-midnight-400 mb-1">BTC rate (post-halving)</p>
            <p className="data-metric text-bitcoin-400">~${btcUsdPerSecond.toFixed(2)}/sec</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
