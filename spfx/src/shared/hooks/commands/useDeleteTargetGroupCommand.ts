import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useDeleteTargetGroupCommand(): {
  state: CommandState;
  execute: (id: number) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (id: number): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = await services.adminService.deleteTargetGroup(id);
    if (result.success) {
      setState({ status: 'success' });
      services.telemetry.trackEvent('targetgroup_deleted', {});
      services.cache.invalidate('targetgroups:');
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      services.telemetry.trackEvent('error_api_call', {
        endpoint: 'deleteTargetGroup',
        errorMessage: result.error.message
      });
      return false;
    }
  }, [services]);

  return { state, execute };
}
