// localStorage persistence helpers for UGC Ad Studio

const FAVORITES_KEY = 'ugc-studio-favorites';
const RATINGS_KEY = 'ugc-studio-ratings';
const CUSTOM_TEMPLATES_KEY = 'ugc-studio-custom-templates';

export function getFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    if (!data) return new Set();
    return new Set(JSON.parse(data) as string[]);
  } catch {
    return new Set();
  }
}

export function setFavorites(favs: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  } catch {
    // Silently fail if localStorage is full
  }
}

export function getRatings(): Record<string, 'up' | 'down'> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(RATINGS_KEY);
    if (!data) return {};
    return JSON.parse(data) as Record<string, 'up' | 'down'>;
  } catch {
    return {};
  }
}

export function setRatings(ratings: Record<string, 'up' | 'down'>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch {
    // Silently fail
  }
}

export interface CustomTemplate {
  name: string;
  emoji: string;
  values: Record<string, string>;
}

export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!data) return [];
    return JSON.parse(data) as CustomTemplate[];
  } catch {
    return [];
  }
}

export function setCustomTemplates(templates: CustomTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    // Silently fail
  }
}
