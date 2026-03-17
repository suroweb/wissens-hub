import { CacheService, CACHE_TTLS } from '../CacheService';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns undefined for cache miss', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('returns stored value for cache hit within TTL', () => {
    cache.set('key', { value: 42 }, 60000);
    expect(cache.get('key')).toEqual({ value: 42 });
  });

  it('returns undefined for expired entry and deletes key', () => {
    cache.set('key', 'data', 1000);
    jest.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
  });

  it('invalidates entries matching prefix pattern', () => {
    cache.set('articles:all', [1, 2]);
    cache.set('articles:page1', { page: 1 });
    cache.set('favorites:all', [3, 4]);
    cache.invalidate('articles:');
    expect(cache.get('articles:all')).toBeUndefined();
    expect(cache.get('articles:page1')).toBeUndefined();
    expect(cache.get('favorites:all')).toEqual([3, 4]);
  });

  it('clear() removes all entries', () => {
    cache.set('a', 1, 60000);
    cache.set('b', 2, 60000);
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });

  it('set() uses default TTL when none provided', () => {
    cache.set('defaultTtl', 'value');
    // Default TTL is 60000ms (1 minute) per CacheService source
    jest.advanceTimersByTime(59999);
    expect(cache.get('defaultTtl')).toBe('value');
    jest.advanceTimersByTime(2);
    expect(cache.get('defaultTtl')).toBeUndefined();
  });

  it('exports CACHE_TTLS with expected keys', () => {
    expect(CACHE_TTLS.ARTICLES).toBe(300000);
    expect(CACHE_TTLS.UNREAD_COUNT).toBe(60000);
    expect(CACHE_TTLS.PENDING_APPROVALS).toBe(30000);
  });
});
