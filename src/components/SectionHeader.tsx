interface SectionHeaderProps {
  kicker?: string;
  kickerLabel?: string;
  title: React.ReactNode;
  subtitle: string;
  align?: 'left' | 'center';
  inView?: boolean;
  id?: string;
  className?: string;
}

export function SectionHeader({
  kicker,
  kickerLabel,
  title,
  subtitle,
  align = 'center',
  inView = true,
  id,
  className = '',
}: SectionHeaderProps) {
  const isLeft = align === 'left';

  return (
    <div
      className={`reveal ${inView ? 'reveal-in' : ''} mb-10 sm:mb-12 ${
        isLeft ? 'max-w-3xl text-left' : 'mx-auto max-w-2xl text-center'
      } ${className}`}
    >
      {(kicker || kickerLabel) && (
        <p className={`section-kicker ${isLeft ? '' : 'justify-center'}`}>
          {kicker && <span className="num">{kicker}</span>}
          {kickerLabel && <span className="label">{kickerLabel}</span>}
        </p>
      )}
      <h2 id={id} className="section-heading">
        {title}
      </h2>
      <p className={`section-subtext ${isLeft ? '' : 'mx-auto'}`}>{subtitle}</p>
    </div>
  );
}
