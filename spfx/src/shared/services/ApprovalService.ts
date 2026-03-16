import { IApiClient } from '../interfaces/IApiClient';
import { IApprovalService } from '../interfaces/IApprovalService';
import { IArticlePage } from '../models/domain/IArticlePage';
import { IApprovalAction } from '../models/domain/IApprovalAction';
import { Result } from '../models/Result';

export class ApprovalService implements IApprovalService {
  public constructor(private readonly api: IApiClient) {}

  public async getPendingApprovals(): Promise<Result<IArticlePage[]>> {
    // Pending approvals are fetched from the API which returns article data
    return this.api.get('/api/articles?status=InReview');
  }

  public async approveArticle(pageId: number, comment?: string): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/approve`, { action: 'Approved', comment });
  }

  public async rejectArticle(pageId: number, comment: string): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/approve`, { action: 'Rejected', comment });
  }

  public async submitForReview(pageId: number): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/approve`, { action: 'Submitted' });
  }

  public async archiveArticle(pageId: number): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/approve`, { action: 'Archived' });
  }

  public async restoreArticle(pageId: number): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/approve`, { action: 'Restored' });
  }

  public async getApprovalHistory(pageId: number): Promise<Result<IApprovalAction[]>> {
    return this.api.get(`/api/articles/${pageId}/history`);
  }
}
