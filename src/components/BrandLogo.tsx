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
      className="relative flex shrink-0 items-end justify-center overflow-hidden rounded-xl border border-bok-border bg-white"
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
                ? 'linear-gradient(to top, #F7931A, #FDBA74)'
                : 'linear-gradient(to top, #16865a, #34a373)',
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
          className="absolute inset-0 bg-gradient-to-t from-transparent to-orange-50/40"
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
      <span className={`${textSize} font-bold text-bok-text`}>
        fiat<span className="text-bitcoin-orange">At</span>Scale
      </span>
    </div>
  );
}
