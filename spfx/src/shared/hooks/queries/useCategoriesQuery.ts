import * as React from 'react';
import { QueryState } from '../../models/AsyncState';
import { ICategory } from '../../interfaces/IAdminService';
import { useWissensHub } from '../../context';

export function useCategoriesQuery(): {
  state: QueryState<ICategory[]>;
  refetch: () => void;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<QueryState<ICategory[]>>({ status: 'idle' });

  const fetch = React.useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    const result = await services.adminService.getCategories();
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
