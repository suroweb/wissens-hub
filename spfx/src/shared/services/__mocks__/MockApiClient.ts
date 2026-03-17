import { IApiClient } from '../../interfaces/IApiClient';
import { Result, fail } from '../../models/Result';
import { delay } from './mockData';

export class MockApiClient implements IApiClient {
  public async get<T>(_endpoint: string): Promise<Result<T>> {
    return delay(fail({ code: 'UNKNOWN', message: 'MockApiClient: use service-specific mocks' }));
  }

  public async post<T>(_endpoint: string, _body?: unknown): Promise<Result<T>> {
    return delay(fail({ code: 'UNKNOWN', message: 'MockApiClient: use service-specific mocks' }));
  }

  public async put<T>(_endpoint: string, _body?: unknown): Promise<Result<T>> {
    return delay(fail({ code: 'UNKNOWN', message: 'MockApiClient: use service-specific mocks' }));
  }

  public async delete<T>(_endpoint: string): Promise<Result<T>> {
    return delay(fail({ code: 'UNKNOWN', message: 'MockApiClient: use service-specific mocks' }));
  }
}
