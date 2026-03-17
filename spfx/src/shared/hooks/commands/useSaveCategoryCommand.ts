import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useSaveCategoryCommand(): {
  state: CommandState;
  execute: (name: string, description: string, id?: number, isActive?: boolean) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (
    name: string,
    description: string,
    id?: number,
    isActive?: boolean
  ): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = id
      ? await services.adminService.updateCategory(id, name, description, isActive !== undefined ? isActive : true)
      : await services.adminService.createCategory(name, description);
    if (result.success) {
      setState({ status: 'success' });
      services.telemetry.trackEvent('category_saved', {});
      services.cache.invalidate('categories:');
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      services.telemetry.trackEvent('error_api_call', {
        endpoint: 'saveCategory',
        errorMessage: result.error.message
      });
      return false;
    }
  }, [services]);

  return { state, execute };
}
