'use client';

import { useSpringCounter } from '@/hooks/useSpringCounter';

// ─── Animated Counter Component ─────────────────────────────────────
export function AnimatedStat({ value, label, icon: Icon }: { value: number; label: string; icon: any }) {
  const animated = useSpringCounter(value, 1000);
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/40 dark:to-rose-900/40 flex items-center justify-center">
        <Icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="text-left">
        <div className="text-base font-bold tabular-nums">{value < 100 ? animated : value}</div>
        <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
      </div>
    </div>
  );
}
