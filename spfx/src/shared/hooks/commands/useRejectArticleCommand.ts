import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useRejectArticleCommand(): {
  state: CommandState;
  execute: (pageId: number, comment: string) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (pageId: number, comment: string): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = await services.approvalService.rejectArticle(pageId, comment);
    if (result.success) {
      setState({ status: 'success' });
      services.telemetry.trackEvent('article_rejected', { pageId: String(pageId) });
      services.cache.invalidate('pending:');
      services.cache.invalidate('articles:');
      services.cache.invalidate('dashstats:');
      services.cache.invalidate('articlestatus:');
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      services.telemetry.trackEvent('error_api_call', {
        endpoint: 'rejectArticle',
        errorMessage: result.error.message
      });
      return false;
    }
  }, [services]);

  return { state, execute };
}
