import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useFlagArticleCommand(): {
  state: CommandState;
  execute: (pageId: number, reason: string) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (pageId: number, reason: string): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = await services.flagService.flagArticle(pageId, reason);
    if (result.success) {
      setState({ status: 'success' });
      services.telemetry.trackEvent('article_flagged', { pageId: String(pageId) });
      services.cache.invalidate('flagged:');
      services.cache.invalidate('articles:');
      services.cache.invalidate('articlestatus:');
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      services.telemetry.trackEvent('error_api_call', {
        endpoint: 'flagArticle',
        errorMessage: result.error.message
      });
      return false;
    }
  }, [services]);

  return { state, execute };
}
