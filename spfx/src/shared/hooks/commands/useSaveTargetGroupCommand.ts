import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useSaveTargetGroupCommand(): {
  state: CommandState;
  execute: (name: string, sharePointGroupName: string, id?: number, isActive?: boolean) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (
    name: string,
    sharePointGroupName: string,
    id?: number,
    isActive?: boolean
  ): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = id
      ? await services.adminService.updateTargetGroup(id, name, isActive !== undefined ? isActive : true)
      : await services.adminService.createTargetGroup(name, sharePointGroupName);
    if (result.success) {
      setState({ status: 'success' });
      services.telemetry.trackEvent('targetgroup_saved', {});
      services.cache.invalidate('targetgroups:');
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      services.telemetry.trackEvent('error_api_call', {
        endpoint: 'saveTargetGroup',
        errorMessage: result.error.message
      });
      return false;
    }
  }, [services]);

  return { state, execute };
}
