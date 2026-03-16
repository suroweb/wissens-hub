export { SharePointPageService } from './SharePointPageService';
export { AzureApiClient } from './AzureApiClient';
export { ReadConfirmationService } from './ReadConfirmationService';
export { FavoriteService } from './FavoriteService';
export { FlagService } from './FlagService';
export { ApprovalService } from './ApprovalService';

import { AadHttpClient } from '@microsoft/sp-http';
import { SPFI } from '@pnp/sp';
import { IServiceContainer } from '../context/ServiceContainer';
import { SharePointPageService } from './SharePointPageService';
import { AzureApiClient } from './AzureApiClient';
import { ReadConfirmationService } from './ReadConfirmationService';
import { FavoriteService } from './FavoriteService';
import { FlagService } from './FlagService';
import { ApprovalService } from './ApprovalService';

export function createProductionServices(
  sp: SPFI,
  aadClient: AadHttpClient,
  apiBaseUrl: string
): IServiceContainer {
  const apiClient = new AzureApiClient(aadClient, apiBaseUrl);
  return {
    pageService: new SharePointPageService(sp),
    apiClient,
    readConfirmationService: new ReadConfirmationService(apiClient),
    favoriteService: new FavoriteService(apiClient),
    flagService: new FlagService(apiClient),
    approvalService: new ApprovalService(apiClient),
  };
}
