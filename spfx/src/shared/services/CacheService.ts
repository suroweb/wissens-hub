interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const CACHE_TTLS = {
  ARTICLES: 300000,          // 5 minutes
  UNREAD_COUNT: 60000,       // 60 seconds
  READ_STATS: 120000,        // 2 minutes
  FAVORITES: 300000,         // 5 minutes
  PENDING_APPROVALS: 30000,  // 30 seconds
  DASHBOARD_STATS: 60000,    // 60 seconds
  CATEGORIES: 300000,        // 5 minutes
  TARGET_GROUPS: 300000,     // 5 minutes
  ADMIN_REPORTS: 120000,     // 2 minutes
  REMINDER_CONFIG: 300000,   // 5 minutes
};

export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();

  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data;
  }

  public set<T>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  public invalidate(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.indexOf(pattern) === 0) {
        this.cache.delete(key);
      }
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}
