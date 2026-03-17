import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { IDetailedReadStats } from '../../interfaces/IAdminService';
import { useWissensHub } from '../../context';

export function useDetailedReadStatsQuery(pageId: number): {
  state: QueryState<IDetailedReadStats>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<IDetailedReadStats>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    if (pageId <= 0) {
      return;
    }
    setState({ status: 'loading' });
    const result = await services.adminService.getDetailedReadStats(pageId);
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
