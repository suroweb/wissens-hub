import { IApiClient } from '../interfaces/IApiClient';
import {
  IAdminService,
  ICategory,
  ITargetGroupConfig,
  IAdminReport,
  IDetailedReadStats,
} from '../interfaces/IAdminService';
import { Result, ok, fail } from '../models/Result';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  errors?: Array<{ field: string | undefined; message: string }>;
}

export class AdminService implements IAdminService {
  public constructor(private readonly apiClient: IApiClient) {}

  private unwrap<T>(result: Result<ApiEnvelope<T>>): Result<T> {
    if (!result.success) {
      return fail(result.error);
    }
    const envelope = result.data;
    if (envelope.success && envelope.data !== undefined) {
      return ok(envelope.data);
    }
    const message = envelope.errors && envelope.errors.length > 0
      ? envelope.errors.map(e => e.message).join(', ')
      : 'Unknown server error';
    return fail({ code: 'UNKNOWN', message });
  }

  public async getCategories(): Promise<Result<ICategory[]>> {
    const result = await this.apiClient.get<ApiEnvelope<ICategory[]>>('/api/administration/categories');
    return this.unwrap(result);
  }

  public async createCategory(name: string, description: string): Promise<Result<ICategory>> {
    const result = await this.apiClient.post<ApiEnvelope<ICategory>>('/api/administration/categories', { name, description });
    return this.unwrap(result);
  }

  public async updateCategory(id: number, name: string, description: string, isActive: boolean): Promise<Result<ICategory>> {
    const result = await this.apiClient.put<ApiEnvelope<ICategory>>('/api/administration/categories/' + id, { id, name, description, isActive });
    return this.unwrap(result);
  }

  public async deleteCategory(id: number): Promise<Result<boolean>> {
    const result = await this.apiClient.delete<ApiEnvelope<boolean>>('/api/administration/categories/' + id);
    return this.unwrap(result);
  }

  public async getTargetGroups(): Promise<Result<ITargetGroupConfig[]>> {
    const result = await this.apiClient.get<ApiEnvelope<ITargetGroupConfig[]>>('/api/administration/target-groups');
    return this.unwrap(result);
  }

  public async createTargetGroup(name: string, sharePointGroupName: string): Promise<Result<ITargetGroupConfig>> {
    const result = await this.apiClient.post<ApiEnvelope<ITargetGroupConfig>>('/api/administration/target-groups', { name, sharePointGroupName });
    return this.unwrap(result);
  }

  public async updateTargetGroup(id: number, name: string, isActive: boolean): Promise<Result<ITargetGroupConfig>> {
    const result = await this.apiClient.put<ApiEnvelope<ITargetGroupConfig>>('/api/administration/target-groups/' + id, { id, name, isActive });
    return this.unwrap(result);
  }

  public async deleteTargetGroup(id: number): Promise<Result<boolean>> {
    const result = await this.apiClient.delete<ApiEnvelope<boolean>>('/api/administration/target-groups/' + id);
    return this.unwrap(result);
  }

  public async getReminderInterval(): Promise<Result<number>> {
    const result = await this.apiClient.get<ApiEnvelope<number>>('/api/administration/reminder-interval');
    return this.unwrap(result);
  }

  public async updateReminderInterval(days: number): Promise<Result<number>> {
    const result = await this.apiClient.put<ApiEnvelope<number>>('/api/administration/reminder-interval', { days });
    return this.unwrap(result);
  }

  public async getAdminReports(): Promise<Result<IAdminReport>> {
    const result = await this.apiClient.get<ApiEnvelope<IAdminReport>>('/api/management/reports');
    return this.unwrap(result);
  }

  public async getDetailedReadStats(pageId: number): Promise<Result<IDetailedReadStats>> {
    const result = await this.apiClient.get<ApiEnvelope<IDetailedReadStats>>('/api/management/reports/' + pageId);
    return this.unwrap(result);
  }
}
