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
import { CacheService } from '../services/CacheService';
import { createTelemetryService } from '../services/TelemetryService';

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
  appInsightsConnectionString?: string;
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
  appInsightsConnectionString,
  children,
}) => {
  const [contextValue, setContextValue] = React.useState<IWissensHubContext | undefined>(undefined);

  React.useEffect(() => {
    const init = async (): Promise<void> => {
      const isProduction = !spContext.isServedFromLocalhost && aadClient !== undefined;

      const cache = new CacheService();
      const telemetry = createTelemetryService(appInsightsConnectionString || '');

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
          telemetry.trackEvent('error_sharepoint', {
            errorMessage: (e as Error).message || 'Failed to get current user',
            source: 'WissensHubProvider.init'
          });
        }

        try {
          const groups = await sp.web.currentUser.groups();
          const groupTitles = groups.map((g: { Title: string }) => g.Title);
          role = resolveRole(groupTitles);
        } catch (e) {
          console.warn('Role detection failed, defaulting to reader:', e);
          role = 'reader';
          telemetry.trackEvent('error_sharepoint', {
            errorMessage: (e as Error).message || 'Role detection failed',
            source: 'WissensHubProvider.init'
          });
        }

        services = { ...createProductionServices(sp, aadClient, apiBaseUrl!), cache, telemetry };
      } else {
        currentUser = MOCK_CURRENT_USER;
        role = mockRole ?? 'reader';
        services = { ...createMockServices(), cache, telemetry };
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
      const fallbackCache = new CacheService();
      const fallbackTelemetry = createTelemetryService(appInsightsConnectionString || '');
      fallbackTelemetry.trackEvent('error_sharepoint', {
        errorMessage: (e as Error).message || 'SharePoint service initialization failed',
        source: 'WissensHubProvider.init'
      });
      // Fallback to mock services so the web part does not stay stuck on null render
      setContextValue({
        services: { ...createMockServices(), cache: fallbackCache, telemetry: fallbackTelemetry },
        currentUser: MOCK_CURRENT_USER,
        role: mockRole ?? 'reader',
        isLoading: false,
      });
    });
  }, []);

  if (contextValue === undefined) {
    // Render an empty container instead of null so SPFx always sees DOM content
    // during async context initialisation. Returning null can cause SPFx hosted
    // workbench to surface an "[object Object]" error page.
    return React.createElement('div', { 'data-automationid': 'wissenshub-loading' });
  }

  return React.createElement(
    WissensHubContext.Provider,
    { value: contextValue },
    children
  );
};

export { WissensHubContext };
