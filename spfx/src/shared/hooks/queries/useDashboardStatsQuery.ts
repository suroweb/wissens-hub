import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { DashboardStatsDto } from '../../models/dto/DashboardStatsDto';
import { useWissensHub } from '../../context';
import { CACHE_TTLS } from '../../services/CacheService';

export function useDashboardStatsQuery(): {
  state: QueryState<DashboardStatsDto>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const cacheKey = 'dashstats:all';
  const hasDataRef = React.useRef(false);

  const [state, setState] = React.useState<QueryState<DashboardStatsDto>>(() => {
    const cached = services.cache.get<DashboardStatsDto>(cacheKey);
    if (cached) {
      // eslint-disable-next-line require-atomic-updates
      hasDataRef.current = true;
      return { status: 'success', data: cached };
    }
    return { status: 'idle' };
  });

  const fetch = React.useCallback(async (): Promise<void> => {
    const hadData = hasDataRef.current;
    if (!hadData) {
      setState({ status: 'loading' });
    }
    const result = await services.apiClient.get<DashboardStatsDto>('/api/dashboard/stats');
    if (result.success) {
      services.cache.set(cacheKey, result.data, CACHE_TTLS.DASHBOARD_STATS);
      services.telemetry.trackEvent('dashboard_loaded', {
        statsCount: String(Object.keys(result.data).length)
      });
      // eslint-disable-next-line require-atomic-updates
      hasDataRef.current = true;
      setState({ status: 'success', data: result.data });
    } else if (!hadData) {
      setState({ status: 'error', error: result.error });
    }
    // If fetch fails but we have stale data, silently keep showing it
  }, [services]);

  React.useEffect(() => {
    fetch().catch(() => { /* error state handled in fetch */ });
  }, [fetch]);

  return { state, refetch: fetch };
}
