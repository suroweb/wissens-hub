import { IApiClient } from '../interfaces/IApiClient';
import { IApprovalService } from '../interfaces/IApprovalService';
import { IArticlePage } from '../models/domain/IArticlePage';
import { Result } from '../models/Result';

export class ApprovalService implements IApprovalService {
  public constructor(private readonly api: IApiClient) {}

  public async getPendingApprovals(): Promise<Result<IArticlePage[]>> {
    // Pending approvals are fetched from the API which returns article data
    return this.api.get('/api/articles?status=InReview');
  }

  public async approveArticle(pageId: number, comment?: string): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/approve`, { action: 'approve', comment });
  }

  public async rejectArticle(pageId: number, comment: string): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/approve`, { action: 'reject', comment });
  }
}
