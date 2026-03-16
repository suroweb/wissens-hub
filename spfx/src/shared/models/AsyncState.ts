import { AppError } from './Result';

export type QueryState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: AppError };

export type CommandState =
  | { status: 'idle' }
  | { status: 'executing' }
  | { status: 'success' }
  | { status: 'error'; error: AppError };
