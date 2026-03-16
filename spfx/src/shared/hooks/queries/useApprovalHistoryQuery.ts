import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IApprovalAction } from '../../models/domain/IApprovalAction';
import { useWissensHub } from '../../context';

export function useApprovalHistoryQuery(pageId: number): {
  state: QueryState<IApprovalAction[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<IApprovalAction[]>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    const result = await services.approvalService.getApprovalHistory(pageId);
    if (result.success) {
      setState({ status: 'success', data: result.data });
    } else {
      setState({ status: 'error', error: result.error });
    }
  }, [services, pageId]);

  React.useEffect(() => {
    fetch().catch(() => { /* error state handled in fetch */ });
  }, [fetch]);

  return { state, refetch: fetch };
}
