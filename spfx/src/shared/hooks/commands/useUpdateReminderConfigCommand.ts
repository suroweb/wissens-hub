import * as React from 'react';
import { CommandState } from '../../models/AsyncState';
import { useWissensHub } from '../../context';

export function useUpdateReminderConfigCommand(): {
  state: CommandState;
  execute: (days: number) => Promise<boolean>;
} {
  const { services } = useWissensHub();
  const [state, setState] = React.useState<CommandState>({ status: 'idle' });

  const execute = React.useCallback(async (days: number): Promise<boolean> => {
    setState({ status: 'executing' });
    const result = await services.adminService.updateReminderInterval(days);
    if (result.success) {
      setState({ status: 'success' });
      return true;
    } else {
      setState({ status: 'error', error: result.error });
      return false;
    }
  }, [services]);

  return { state, execute };
}
