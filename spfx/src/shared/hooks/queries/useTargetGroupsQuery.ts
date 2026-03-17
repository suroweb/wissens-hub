import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { ITargetGroupConfig } from '../../interfaces/IAdminService';
import { useWissensHub } from '../../context';

export function useTargetGroupsQuery(): {
  state: QueryState<ITargetGroupConfig[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<ITargetGroupConfig[]>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    const result = await services.adminService.getTargetGroups();
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
