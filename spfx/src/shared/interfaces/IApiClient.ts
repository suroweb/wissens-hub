import { Result } from '../models/Result';

export interface IApiClient {
  get<T>(endpoint: string): Promise<Result<T>>;
  post<T>(endpoint: string, body?: unknown): Promise<Result<T>>;
  put<T>(endpoint: string, body?: unknown): Promise<Result<T>>;
  delete<T>(endpoint: string): Promise<Result<T>>;
}
