import * as React from 'react';
import { useWissensHub } from '../context/WissensHubContext';
import { UserRole, ROLE_HIERARCHY } from '../models/domain/types';

export interface IRoleGateProps {
  minimumRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<IRoleGateProps> = ({ minimumRole, children, fallback }) => {
  const { role } = useWissensHub();
  const userIndex = ROLE_HIERARCHY.indexOf(role);
  const requiredIndex = ROLE_HIERARCHY.indexOf(minimumRole);

  if (userIndex >= requiredIndex) {
    return React.createElement(React.Fragment, undefined, children);
  }

  return fallback
    ? React.createElement(React.Fragment, undefined, fallback)
    // eslint-disable-next-line @rushstack/no-new-null
    : (null as unknown as React.ReactElement);
};
