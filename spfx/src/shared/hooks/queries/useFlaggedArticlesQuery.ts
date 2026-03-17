import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IFlag } from '../../models/domain/IFlag';
import { useWissensHub } from '../../context';
import { CACHE_TTLS } from '../../services/CacheService';

export function useFlaggedArticlesQuery(): {
  state: QueryState<IFlag[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const cacheKey = 'flagged:all';
  const hasDataRef = React.useRef(false);

  const [state, setState] = React.useState<QueryState<IFlag[]>>(() => {
    const cached = services.cache.get<IFlag[]>(cacheKey);
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
    const result = await services.flagService.getFlaggedArticles();
    if (result.success) {
      services.cache.set(cacheKey, result.data, CACHE_TTLS.PENDING_APPROVALS);
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
