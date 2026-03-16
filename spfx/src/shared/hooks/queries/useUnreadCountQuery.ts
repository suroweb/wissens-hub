import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { DashboardStatsDto } from '../../models/dto/DashboardStatsDto';
import { useWissensHub } from '../../context';

export function useUnreadCountQuery(): {
  state: QueryState<DashboardStatsDto>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<DashboardStatsDto>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    const result = await services.apiClient.get<DashboardStatsDto>('/api/dashboard/stats');
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
