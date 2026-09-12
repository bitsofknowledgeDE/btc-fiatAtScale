import { useCallback, useState } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  /** Right-hand read-out next to the label */
  readout?: string;
  fieldWidth?: string;
}

// Partial decimals the user may be in the middle of typing: "", ".", "0.", ".2", "12."
const PARTIAL_DECIMAL = /^\d*\.?\d*$/;

/**
 * Slider + number-field pair (cross-site UX gate, decision 2026-09-09).
 * While the text field is focused the raw string stays untouched and clamping
 * happens on blur — a controlled number input that snaps to `min` on a
 * transient empty value turns ".5" into "0.05". Reference:
 * Websites/btc-bitcoinsavingscalculator/src/components/SliderInput.tsx
 */
export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  hint,
  readout,
  fieldWidth = 'w-20',
}: SliderInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max]);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(null);
      onChange(parseFloat(e.target.value));
    },
    [onChange],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(',', '.');
      if (!PARTIAL_DECIMAL.test(raw)) return;
      setDraft(raw);
      const parsed = parseFloat(raw);
      // Live-update for complete numbers inside the range; out-of-range values
      // are applied (clamped) when the field is left.
      if (!isNaN(parsed) && parsed >= min && parsed <= max) onChange(parsed);
    },
    [onChange, min, max],
  );

  const commit = useCallback(() => {
    if (draft !== null) {
      const parsed = parseFloat(draft);
      if (!isNaN(parsed)) onChange(clamp(parsed));
    }
    setDraft(null);
  }, [draft, onChange, clamp]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  }, []);

  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-bok-muted">{label}</label>
        {readout && (
          <span className="text-xs tabular-nums text-bok-muted">{readout}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {prefix && <span className="shrink-0 text-sm text-bok-muted">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`input-field shrink-0 text-center tabular-nums ${fieldWidth}`}
          value={draft ?? String(value)}
          onChange={handleInput}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          aria-label={label}
        />
        {suffix && <span className="shrink-0 text-sm text-bok-muted">{suffix}</span>}
        <div className="relative min-w-0 flex-1 py-1">
          <input
            type="range"
            className="range-slider w-full"
            value={value}
            onChange={handleSlider}
            min={min}
            max={max}
            step={step}
            aria-label={`${label} slider`}
            style={{ '--fill-percent': `${fillPercent}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {hint && <p className="mt-1 text-xs text-bok-muted">{hint}</p>}
    </div>
  );
}
