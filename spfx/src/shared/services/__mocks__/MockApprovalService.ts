import { IApprovalService } from '../../interfaces/IApprovalService';
import { IArticlePage } from '../../models/domain/IArticlePage';
import { Result, ok } from '../../models/Result';
import { MOCK_ARTICLES, delay } from './mockData';

export class MockApprovalService implements IApprovalService {
  private readonly articles: IArticlePage[];

  public constructor() {
    this.articles = [...MOCK_ARTICLES];
  }

  public async getPendingApprovals(): Promise<Result<IArticlePage[]>> {
    const pending = this.articles.filter(a => a.status === 'InReview');
    return delay(ok(pending));
  }

  public async approveArticle(_pageId: number, _comment?: string): Promise<Result<void>> {
    return delay(ok(undefined as unknown as void));
  }

  public async rejectArticle(_pageId: number, _comment: string): Promise<Result<void>> {
    return delay(ok(undefined as unknown as void));
  }
}
