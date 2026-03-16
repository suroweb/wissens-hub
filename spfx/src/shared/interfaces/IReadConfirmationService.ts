import { Result } from '../models/Result';
import { IReadConfirmation } from '../models/domain/IReadConfirmation';

export interface IReadConfirmationService {
  getReadStatus(pageId: number): Promise<Result<IReadConfirmation | undefined>>;
  markAsRead(pageId: number): Promise<Result<void>>;
  getReadStats(pageId: number): Promise<Result<IReadConfirmation[]>>;
}
