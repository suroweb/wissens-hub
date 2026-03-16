export type AppError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'UNAUTHORIZED'; message: string }
  | { code: 'NETWORK_ERROR'; message: string }
  | { code: 'VALIDATION_ERROR'; message: string; fields?: Record<string, string> }
  | { code: 'UNKNOWN'; message: string };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export const ok = <T>(data: T): Result<T> => ({ success: true, data });

export const fail = <T>(error: AppError): Result<T> => ({ success: false, error });
