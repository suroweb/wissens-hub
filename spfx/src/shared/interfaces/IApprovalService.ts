import { Result } from '../models/Result';
import { IArticlePage } from '../models/domain/IArticlePage';
import { IApprovalAction } from '../models/domain/IApprovalAction';

export interface IApprovalService {
  getPendingApprovals(): Promise<Result<IArticlePage[]>>;
  approveArticle(pageId: number, comment?: string): Promise<Result<void>>;
  rejectArticle(pageId: number, comment: string): Promise<Result<void>>;
  submitForReview(pageId: number): Promise<Result<void>>;
  archiveArticle(pageId: number): Promise<Result<void>>;
  restoreArticle(pageId: number): Promise<Result<void>>;
  getApprovalHistory(pageId: number): Promise<Result<IApprovalAction[]>>;
}
