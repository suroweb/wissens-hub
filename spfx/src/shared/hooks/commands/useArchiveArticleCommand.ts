import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useArchiveArticleCommand(): {
  state: CommandState;
  execute: (pageId: number) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (pageId: number): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = await services.approvalService.archiveArticle(pageId);
    if (result.success) {
      setState({ status: 'success' });
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      return false;
    }
  }, [services]);

  return { state, execute };
}
