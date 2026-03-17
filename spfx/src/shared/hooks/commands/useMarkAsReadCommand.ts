import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useMarkAsReadCommand(): {
  state: CommandState;
  execute: (pageId: number) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (pageId: number): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = await services.readConfirmationService.markAsRead(pageId);
    if (result.success) {
      setState({ status: 'success' });
      services.telemetry.trackEvent('article_read', { pageId: String(pageId) });
      services.cache.invalidate('articles:');
      services.cache.invalidate('unread:');
      services.cache.invalidate('readstats:');
      services.cache.invalidate('dashstats:');
      services.cache.invalidate('articlestatus:');
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      services.telemetry.trackEvent('error_api_call', {
        endpoint: 'markAsRead',
        errorMessage: result.error.message
      });
      return false;
    }
  }, [services]);

  return { state, execute };
}
