import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IFavorite } from '../../models/domain/IFavorite';
import { useWissensHub } from '../../context';

export function useFavoritesQuery(): {
  state: QueryState<IFavorite[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<IFavorite[]>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    const result = await services.favoriteService.getFavorites();
    if (result.success) {
      setState({ status: 'success', data: result.data });
    } else {
      setState({ status: 'error', error: result.error });
    }
  }, [services]);

  React.useEffect(() => {
    fetch().catch(() => { /* error state handled in fetch */ });
  }, [fetch]);

  return { state, refetch: fetch };
}
