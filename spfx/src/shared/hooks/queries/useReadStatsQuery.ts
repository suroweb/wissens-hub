import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IReadConfirmation } from '../../models/domain/IReadConfirmation';
import { useWissensHub } from '../../context';

export function useReadStatsQuery(pageId: number): {
  state: QueryState<IReadConfirmation[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<IReadConfirmation[]>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    const result = await services.readConfirmationService.getReadStats(pageId);
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
