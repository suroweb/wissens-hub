import { AadHttpClient } from '@microsoft/sp-http';
import { IApiClient } from '../interfaces/IApiClient';
import { Result, AppError, ok, fail } from '../models/Result';

export class AzureApiClient implements IApiClient {
  public constructor(
    private readonly client: AadHttpClient,
    private readonly baseUrl: string
  ) {}

  public async get<T>(endpoint: string): Promise<Result<T>> {
    try {
      const response = await this.client.get(
        `${this.baseUrl}${endpoint}`,
        AadHttpClient.configurations.v1
      );
      if (!response.ok) {
        return fail(this.mapHttpError(response.status));
      }
      const data = await response.json() as T;
      return ok(data);
    } catch (e) {
      return fail({ code: 'NETWORK_ERROR', message: (e as Error).message });
    }
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<Result<T>> {
    try {
      const response = await this.client.post(
        `${this.baseUrl}${endpoint}`,
        AadHttpClient.configurations.v1,
        {
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        }
      );
      if (!response.ok) {
        return fail(this.mapHttpError(response.status));
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) as T : (undefined as unknown as T);
      return ok(data);
    } catch (e) {
      return fail({ code: 'NETWORK_ERROR', message: (e as Error).message });
    }
  }

  public async put<T>(endpoint: string, body?: unknown): Promise<Result<T>> {
    try {
      const response = await this.client.fetch(
        `${this.baseUrl}${endpoint}`,
        AadHttpClient.configurations.v1,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        }
      );
      if (!response.ok) {
        return fail(this.mapHttpError(response.status));
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) as T : (undefined as unknown as T);
      return ok(data);
    } catch (e) {
      return fail({ code: 'NETWORK_ERROR', message: (e as Error).message });
    }
  }

  public async delete<T>(endpoint: string): Promise<Result<T>> {
    try {
      const response = await this.client.fetch(
        `${this.baseUrl}${endpoint}`,
        AadHttpClient.configurations.v1,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        return fail(this.mapHttpError(response.status));
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) as T : (undefined as unknown as T);
      return ok(data);
    } catch (e) {
      return fail({ code: 'NETWORK_ERROR', message: (e as Error).message });
    }
  }

  private mapHttpError(status: number): AppError {
    switch (status) {
      case 401: return { code: 'UNAUTHORIZED', message: 'Authentication required' };
      case 403: return { code: 'UNAUTHORIZED', message: 'Insufficient permissions' };
      case 404: return { code: 'NOT_FOUND', message: 'Resource not found' };
      default: return { code: 'UNKNOWN', message: `HTTP ${status}` };
    }
  }
}
