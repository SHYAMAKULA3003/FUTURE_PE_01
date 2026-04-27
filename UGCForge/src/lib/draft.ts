'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Draft Auto-Save Hook ──────────────────────────────────
export function useDraftAutoSave(form: Record<string, string>, debounceMs: number = 2000) {
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasContent = Object.values(form).some(v => v && v.trim());
    if (!hasContent) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('ugc-studio-draft', JSON.stringify(form));
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 1500);
      } catch { /* ignore */ }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [form, debounceMs]);

  return { showSaveIndicator };
}

export function loadDraft(): Record<string, string> | null {
  try {
    if (typeof window === 'undefined') return null;
    const draft = localStorage.getItem('ugc-studio-draft');
    return draft ? JSON.parse(draft) : null;
  } catch { return null; }
}

export function clearDraft() {
  try { if (typeof window !== 'undefined') localStorage.removeItem('ugc-studio-draft'); } catch { /* ignore */ }
}
