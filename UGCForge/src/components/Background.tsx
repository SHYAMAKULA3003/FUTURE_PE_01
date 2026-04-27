'use client';

import React, { useMemo } from 'react';

// ─── Animated Background Orbs (Enhanced) ───────────────────────────
export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-200/30 to-rose-200/30 dark:from-orange-900/20 dark:to-rose-900/20 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute top-[30%] -right-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-pink-200/20 to-amber-200/20 dark:from-pink-900/15 dark:to-amber-900/15 blur-3xl animate-[float_10s_ease-in-out_infinite_2s]" />
      <div className="absolute -bottom-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-rose-200/20 to-orange-100/20 dark:from-rose-900/10 dark:to-orange-900/10 blur-3xl animate-[float_12s_ease-in-out_infinite_4s]" />
      {/* Extra orbs for more depth */}
      <div className="absolute top-[60%] left-[5%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-amber-100/15 to-orange-100/10 dark:from-amber-900/10 dark:to-orange-900/5 blur-3xl animate-[float_14s_ease-in-out_infinite_1s]" />
      <div className="absolute top-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-rose-100/15 to-pink-100/10 dark:from-rose-900/8 dark:to-pink-900/5 blur-3xl animate-[float_16s_ease-in-out_infinite_3s]" />
    </div>
  );
}

// ─── Floating Particles ────────────────────────────────────
export function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 8,
      color: ['rgba(249,115,22,0.3)', 'rgba(244,63,94,0.2)', 'rgba(236,72,153,0.2)', 'rgba(251,146,60,0.25)'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-[8]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-particle"
          style={{
            left: p.left,
            '--p-size': `${p.size}px`,
            '--p-duration': `${p.duration}s`,
            '--p-delay': `${p.delay}s`,
            '--p-color': p.color,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
