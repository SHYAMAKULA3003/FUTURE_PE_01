'use client';

import React, { useRef, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

// ─── 3D Tilt Card Component ──────────────────────────────────
export function TiltCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card cursor-default"
      style={{ transition: 'transform 0.15s ease-out' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Confetti Component ──────────────────────────────────────
const CONFETTI_COLORS = ['#f97316', '#f43f5e', '#f59e0b', '#ec4899', '#fb923c', '#fbbf24'];

export function Confetti() {
  const particles = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.8,
      duration: Math.random() * 1 + 1.5,
      radius: Math.random() > 0.5 ? '50%' : '2px',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            '--size': `${p.size}px`,
            '--color': p.color,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
            '--radius': p.radius,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Magnetic Button Component ────────────────────────────────
export function MagneticButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / rect.width;
    const dy = (e.clientY - centerY) / rect.height;
    const maxMove = 3;
    setPosition({ x: dx * maxMove, y: dy * maxMove });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <div
        className={className}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: position.x === 0 && position.y === 0 ? 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)' : 'transform 0.15s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Ripple Button Component ───────────────────────────────
export function RippleButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ref.current.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    onClick?.(e);
  }, [onClick]);

  return (
    <button ref={ref} onClick={handleClick} className={`ripple-btn ${className}`}>
      {children}
    </button>
  );
}
