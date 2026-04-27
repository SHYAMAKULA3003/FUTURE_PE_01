// ─── Activity Feed Storage ─────────────────────────────────
export interface ActivityItem {
  id: string;
  type: 'generated' | 'exported' | 'deleted' | 'cloned' | 'edited';
  productName: string;
  timestamp: number;
}

export function getActivityFeed(): ActivityItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const feed = localStorage.getItem('ugc-studio-activity');
    return feed ? JSON.parse(feed) : [];
  } catch { return []; }
}

export function addActivityItem(item: Omit<ActivityItem, 'id' | 'timestamp'>) {
  try {
    if (typeof window === 'undefined') return;
    const feed = getActivityFeed();
    feed.unshift({ ...item, id: Date.now().toString(36), timestamp: Date.now() });
    if (feed.length > 20) feed.length = 20; // Keep last 20
    localStorage.setItem('ugc-studio-activity', JSON.stringify(feed));
  } catch { /* ignore */ }
}

export function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
