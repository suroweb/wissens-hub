import { Result } from '../models/Result';
import { IArticlePage } from '../models/domain/IArticlePage';

export interface IApprovalService {
  getPendingApprovals(): Promise<Result<IArticlePage[]>>;
  approveArticle(pageId: number, comment?: string): Promise<Result<void>>;
  rejectArticle(pageId: number, comment: string): Promise<Result<void>>;
}
