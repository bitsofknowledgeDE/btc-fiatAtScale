import { useState, useEffect } from 'react';

export function useCountUp(end: number, duration: number = 2000, start: number = 0, enabled: boolean = true) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!enabled) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(start + (end - start) * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start, enabled]);

  return count;
}

export function useLiveCounter(baseValue: number, incrementPerSecond: number) {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + incrementPerSecond / 60);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [incrementPerSecond]);

  return value;
}
