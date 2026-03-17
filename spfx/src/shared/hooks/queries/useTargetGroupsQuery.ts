import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { ITargetGroupConfig } from '../../interfaces/IAdminService';
import { useWissensHub } from '../../context';
import { CACHE_TTLS } from '../../services/CacheService';

export function useTargetGroupsQuery(): {
  state: QueryState<ITargetGroupConfig[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const cacheKey = 'targetgroups:all';
  const hasDataRef = React.useRef(false);

  const [state, setState] = React.useState<QueryState<ITargetGroupConfig[]>>(() => {
    const cached = services.cache.get<ITargetGroupConfig[]>(cacheKey);
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
    const result = await services.adminService.getTargetGroups();
    if (result.success) {
      services.cache.set(cacheKey, result.data, CACHE_TTLS.TARGET_GROUPS);
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
