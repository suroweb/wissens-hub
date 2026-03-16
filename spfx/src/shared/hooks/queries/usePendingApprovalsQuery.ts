import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IArticlePage } from '../../models/domain/IArticlePage';
import { useWissensHub } from '../../context';

export function usePendingApprovalsQuery(): {
  state: QueryState<IArticlePage[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<IArticlePage[]>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    const result = await services.approvalService.getPendingApprovals();
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
