import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { AadHttpClient } from '@microsoft/sp-http';
import { UserRole, ROLE_HIERARCHY } from '../models/domain/types';
import { ICurrentUser } from '../models/domain/IUser';
import { IServiceContainer } from './ServiceContainer';
import { getSP } from './pnpSetup';
import { createProductionServices } from '../services';
import { createMockServices } from '../services/__mocks__';
import { MOCK_CURRENT_USER } from '../services/__mocks__/mockData';

export interface IWissensHubContext {
  services: IServiceContainer;
  currentUser: ICurrentUser;
  role: UserRole;
  isLoading: boolean;
}

export interface IWissensHubProviderProps {
  spContext: WebPartContext;
  aadClient?: AadHttpClient;
  apiBaseUrl?: string;
  mockRole?: UserRole;
  children: React.ReactNode;
}

const roleMap: Record<string, UserRole> = {
  'WissensHub Owners': 'admin',
  'WissensHub Reviewers': 'reviewer',
  'WissensHub Editors': 'editor',
  'WissensHub Members': 'reader',
};

function resolveRole(groupTitles: string[]): UserRole {
  let highest: UserRole = 'reader';
  for (const title of groupTitles) {
    const mapped = roleMap[title];
    if (mapped && ROLE_HIERARCHY.indexOf(mapped) > ROLE_HIERARCHY.indexOf(highest)) {
      highest = mapped;
    }
  }
  return highest;
}

const WissensHubContext = React.createContext<IWissensHubContext | undefined>(undefined);

export function useWissensHub(): IWissensHubContext {
  const ctx = React.useContext(WissensHubContext);
  if (ctx === undefined) {
    throw new Error('useWissensHub must be used within a WissensHubProvider');
  }
  return ctx;
}

export const WissensHubProvider: React.FC<IWissensHubProviderProps> = ({
  spContext,
  aadClient,
  apiBaseUrl,
  mockRole,
  children,
}) => {
  const [contextValue, setContextValue] = React.useState<IWissensHubContext | undefined>(undefined);

  React.useEffect(() => {
    const init = async (): Promise<void> => {
      const isProduction = !spContext.isServedFromLocalhost && aadClient !== undefined;

      let currentUser: ICurrentUser;
      let role: UserRole;
      let services: IServiceContainer;

      if (isProduction) {
        const sp = getSP(spContext);

        try {
          const spUser = await sp.web.currentUser();
          currentUser = {
            displayName: spUser.Title,
            email: spUser.Email,
            loginName: spUser.LoginName,
          };
        } catch (e) {
          console.warn('Failed to get current user from SharePoint:', e);
          currentUser = {
            displayName: spContext.pageContext.user.displayName,
            email: spContext.pageContext.user.email,
            loginName: spContext.pageContext.user.loginName,
          };
        }

        try {
          const groups = await sp.web.currentUser.groups();
          const groupTitles = groups.map((g: { Title: string }) => g.Title);
          role = resolveRole(groupTitles);
        } catch (e) {
          console.warn('Role detection failed, defaulting to reader:', e);
          role = 'reader';
        }

        services = createProductionServices(sp, aadClient, apiBaseUrl!);
      } else {
        currentUser = MOCK_CURRENT_USER;
        role = mockRole ?? 'reader';
        services = createMockServices();
      }

      setContextValue({
        services,
        currentUser,
        role,
        isLoading: false,
      });
    };

    init().catch((e) => {
      console.error('WissensHubProvider initialization failed:', e);
    });
  }, []);

  if (contextValue === undefined) {
    // eslint-disable-next-line @rushstack/no-new-null
    return null as unknown as React.ReactElement;
  }

  return React.createElement(
    WissensHubContext.Provider,
    { value: contextValue },
    children
  );
};

export { WissensHubContext };
