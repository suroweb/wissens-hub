import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useToggleFavoriteCommand(): {
  state: CommandState;
  isFavorited?: boolean;
  execute: (pageId: number) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });
  const [isFavorited, setIsFavorited] = React.useState<boolean | undefined>(undefined);

  const execute = React.useCallback(async (pageId: number): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = await services.favoriteService.toggleFavorite(pageId);
    if (result.success) {
      setState({ status: 'success' });
      setIsFavorited(result.data.isFavorited);
      services.telemetry.trackEvent('article_favorited', { pageId: String(pageId) });
      services.cache.invalidate('favorites:');
      services.cache.invalidate('dashstats:');
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      services.telemetry.trackEvent('error_api_call', {
        endpoint: 'toggleFavorite',
        errorMessage: result.error.message
      });
      return false;
    }
  }, [services]);

  return { state, isFavorited, execute };
}
