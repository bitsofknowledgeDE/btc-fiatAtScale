import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const barHeights = [0.3, 0.45, 0.6, 0.78, 1.0];

export function BrandLogo({ size = 'md', animate = true }: BrandLogoProps) {
  const dims = size === 'sm' ? { w: 36, h: 36 } : size === 'md' ? { w: 36, h: 36 } : { w: 48, h: 48 };
  const barWidth = dims.w / (barHeights.length * 2);
  const gap = barWidth * 0.6;

  return (
    <div
      className="relative flex items-end justify-center rounded-xl bg-gradient-to-br from-midnight-800 to-midnight-900 border border-bok-border overflow-hidden shrink-0"
      style={{ width: dims.w, height: dims.h, padding: '5px', boxShadow: '0 2px 10px rgba(247,147,26,0.15)' }}
    >
      {barHeights.map((h, i) => {
        const barH = (dims.h - 8) * h;
        const isLast = i === barHeights.length - 1;
        return (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{
              width: barWidth,
              marginRight: i < barHeights.length - 1 ? gap : 0,
              background: isLast
                ? 'linear-gradient(to top, #f7931a, #ffca28)'
                : 'linear-gradient(to top, #4caf50, #81c784)',
              opacity: isLast ? 1 : 0.6 + i * 0.1,
            }}
            initial={{ height: 0 }}
            animate={animate ? { height: barH } : { height: barH }}
            transition={{
              duration: 0.6,
              delay: i * 0.08,
              ease: 'easeOut',
            }}
          />
        );
      })}
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl';
  return (
    <div className="flex items-center gap-2">
      <BrandLogo size={size} />
      <span className={`${textSize} font-bold text-midnight-100`}>
        fiat<span className="text-bitcoin-400">At</span>Scale
      </span>
    </div>
  );
}
