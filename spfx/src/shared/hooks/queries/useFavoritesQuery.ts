import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IFavorite } from '../../models/domain/IFavorite';
import { useWissensHub } from '../../context';
import { CACHE_TTLS } from '../../services/CacheService';

export function useFavoritesQuery(): {
  state: QueryState<IFavorite[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const cacheKey = 'favorites:all';
  const hasDataRef = React.useRef(false);

  const [state, setState] = React.useState<QueryState<IFavorite[]>>(() => {
    const cached = services.cache.get<IFavorite[]>(cacheKey);
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
    const result = await services.favoriteService.getFavorites();
    if (result.success) {
      services.cache.set(cacheKey, result.data, CACHE_TTLS.FAVORITES);
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
