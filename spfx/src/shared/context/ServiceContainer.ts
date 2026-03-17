import { IPageService } from '../interfaces/IPageService';
import { IApiClient } from '../interfaces/IApiClient';
import { IReadConfirmationService } from '../interfaces/IReadConfirmationService';
import { IFavoriteService } from '../interfaces/IFavoriteService';
import { IFlagService } from '../interfaces/IFlagService';
import { IApprovalService } from '../interfaces/IApprovalService';
import { IAdminService } from '../interfaces/IAdminService';
import { CacheService } from '../services/CacheService';
import { ITelemetryService } from '../services/TelemetryService';

export interface IServiceContainer {
  pageService: IPageService;
  apiClient: IApiClient;
  readConfirmationService: IReadConfirmationService;
  favoriteService: IFavoriteService;
  flagService: IFlagService;
  approvalService: IApprovalService;
  adminService: IAdminService;
  cache: CacheService;
  telemetry: ITelemetryService;
}

export function createServiceContainer(services: IServiceContainer): IServiceContainer {
  return services;
}
