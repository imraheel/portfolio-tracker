import { useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1000,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState('');
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration / 1000,
  });

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (ref.current) {
        const formatted = latest.toLocaleString('en-PK', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        setDisplayValue(`${prefix}${formatted}${suffix}`);
      }
    });
    return () => unsubscribe();
  }, [spring, prefix, suffix, decimals]);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
    </span>
  );
}
