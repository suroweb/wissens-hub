import { AadHttpClient } from '@microsoft/sp-http';

export interface IDashboardProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  httpClient?: AadHttpClient;
  apiBaseUrl?: string;
}
