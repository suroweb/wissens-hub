import { IApprovalService } from '../../interfaces/IApprovalService';
import { IArticlePage } from '../../models/domain/IArticlePage';
import { IApprovalAction } from '../../models/domain/IApprovalAction';
import { ArticleStatus } from '../../models/domain/types';
import { Result, ok } from '../../models/Result';
import { MOCK_ARTICLES, MOCK_APPROVAL_HISTORY, delay } from './mockData';

export class MockApprovalService implements IApprovalService {
  private readonly articles: IArticlePage[];
  private readonly history: IApprovalAction[];

  public constructor() {
    this.articles = [...MOCK_ARTICLES];
    this.history = [...MOCK_APPROVAL_HISTORY];
  }

  public async getPendingApprovals(): Promise<Result<IArticlePage[]>> {
    const pending = this.articles.filter(a => a.status === 'InReview');
    return delay(ok(pending));
  }

  public async approveArticle(pageId: number, comment?: string): Promise<Result<void>> {
    const article = this.articles.find(a => a.id === pageId);
    if (article) { (article as { status: ArticleStatus }).status = 'Published'; }
    this.history.push({
      id: this.history.length + 1, pageId, actionBy: 'mock-user-id',
      actionByDisplayName: 'Max Mustermann', actionDate: new Date(),
      fromStatus: 'InReview', toStatus: 'Published', comment: comment || undefined,
    });
    return delay(ok(undefined as unknown as void));
  }

  public async rejectArticle(pageId: number, comment: string): Promise<Result<void>> {
    const article = this.articles.find(a => a.id === pageId);
    if (article) { (article as { status: ArticleStatus }).status = 'Draft'; }
    this.history.push({
      id: this.history.length + 1, pageId, actionBy: 'mock-user-id',
      actionByDisplayName: 'Max Mustermann', actionDate: new Date(),
      fromStatus: 'InReview', toStatus: 'Draft', comment,
    });
    return delay(ok(undefined as unknown as void));
  }

  public async submitForReview(pageId: number): Promise<Result<void>> {
    const article = this.articles.find(a => a.id === pageId);
    if (article) { (article as { status: ArticleStatus }).status = 'InReview'; }
    this.history.push({
      id: this.history.length + 1, pageId, actionBy: 'mock-user-id',
      actionByDisplayName: 'Max Mustermann', actionDate: new Date(),
      fromStatus: 'Draft', toStatus: 'InReview',
    });
    return delay(ok(undefined as unknown as void));
  }

  public async archiveArticle(pageId: number): Promise<Result<void>> {
    const article = this.articles.find(a => a.id === pageId);
    if (article) { (article as { status: ArticleStatus }).status = 'Archived'; }
    this.history.push({
      id: this.history.length + 1, pageId, actionBy: 'mock-user-id',
      actionByDisplayName: 'Max Mustermann', actionDate: new Date(),
      fromStatus: 'Published', toStatus: 'Archived',
    });
    return delay(ok(undefined as unknown as void));
  }

  public async restoreArticle(pageId: number): Promise<Result<void>> {
    const article = this.articles.find(a => a.id === pageId);
    if (article) { (article as { status: ArticleStatus }).status = 'Published'; }
    this.history.push({
      id: this.history.length + 1, pageId, actionBy: 'mock-user-id',
      actionByDisplayName: 'Max Mustermann', actionDate: new Date(),
      fromStatus: 'Archived', toStatus: 'Published',
    });
    return delay(ok(undefined as unknown as void));
  }

  public async getApprovalHistory(pageId: number): Promise<Result<IApprovalAction[]>> {
    const filtered = this.history.filter(h => h.pageId === pageId);
    return delay(ok(filtered));
  }
}
