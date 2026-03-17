export { MockPageService } from './MockPageService';
export { MockApiClient } from './MockApiClient';
export { MockReadConfirmationService } from './MockReadConfirmationService';
export { MockFavoriteService } from './MockFavoriteService';
export { MockFlagService } from './MockFlagService';
export { MockApprovalService } from './MockApprovalService';
export { MockAdminService } from './MockAdminService';

import { IServiceContainer } from '../../context/ServiceContainer';
import { MockPageService } from './MockPageService';
import { MockApiClient } from './MockApiClient';
import { MockReadConfirmationService } from './MockReadConfirmationService';
import { MockFavoriteService } from './MockFavoriteService';
import { MockFlagService } from './MockFlagService';
import { MockApprovalService } from './MockApprovalService';
import { MockAdminService } from './MockAdminService';

export function createMockServices(): IServiceContainer {
  return {
    pageService: new MockPageService(),
    apiClient: new MockApiClient(),
    readConfirmationService: new MockReadConfirmationService(),
    favoriteService: new MockFavoriteService(),
    flagService: new MockFlagService(),
    approvalService: new MockApprovalService(),
    adminService: new MockAdminService(),
  };
}
