'use client';

import { useState, useEffect } from 'react';

export function useSpringCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let startTime: number;
    let raf: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const overshoot = progress < 1 ? eased * (1 + 0.1 * Math.sin(progress * Math.PI)) : 1;
      setCount(Math.round(overshoot * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}
