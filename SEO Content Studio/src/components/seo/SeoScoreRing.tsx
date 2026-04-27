'use client';

import { useEffect, useState } from 'react';

interface SeoScoreRingProps {
  score: number;
  size?: number;
}

export function SeoScoreRing({ score, size = 80 }: SeoScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const color =
    animatedScore >= 80
      ? 'text-emerald-500'
      : animatedScore >= 60
        ? 'text-amber-500'
        : 'text-rose-500';

  const strokeColor =
    animatedScore >= 80
      ? '#10b981'
      : animatedScore >= 60
        ? '#f59e0b'
        : '#ef4444';

  const label =
    animatedScore >= 80
      ? 'Excellent'
      : animatedScore >= 60
        ? 'Good'
        : animatedScore >= 40
          ? 'Fair'
          : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/50"
          />
          {/* Score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${color}`}>{animatedScore}</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
