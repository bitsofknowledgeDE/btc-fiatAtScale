import { motion } from 'framer-motion';

interface SectionHeaderProps {
  kicker?: string;
  kickerLabel?: string;
  title: React.ReactNode;
  subtitle: string;
  align?: 'left' | 'center';
  inView?: boolean;
  className?: string;
}

export function SectionHeader({
  kicker,
  kickerLabel,
  title,
  subtitle,
  align = 'center',
  inView = true,
  className = '',
}: SectionHeaderProps) {
  const isLeft = align === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-12 sm:mb-16 ${isLeft ? 'text-left max-w-3xl' : 'text-center mx-auto max-w-2xl'} ${className}`}
    >
      {(kicker || kickerLabel) && (
        <p className={`section-kicker ${isLeft ? '' : 'justify-center'}`}>
          {kicker && <span className="num">{kicker}</span>}
          {kickerLabel && <span className="label">{kickerLabel}</span>}
        </p>
      )}
      <h2 className="section-heading">{title}</h2>
      <p className={`section-subtext ${isLeft ? '' : 'mx-auto'}`}>{subtitle}</p>
    </motion.div>
  );
}
