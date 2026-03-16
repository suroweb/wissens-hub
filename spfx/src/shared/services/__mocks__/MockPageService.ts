import { IPageService } from '../../interfaces/IPageService';
import { IArticlePage } from '../../models/domain/IArticlePage';
import { Result, ok, fail } from '../../models/Result';
import { MOCK_ARTICLES, delay } from './mockData';

export class MockPageService implements IPageService {
  private readonly articles: IArticlePage[];

  public constructor() {
    this.articles = [...MOCK_ARTICLES];
  }

  public async getPublishedArticles(): Promise<Result<IArticlePage[]>> {
    const published = this.articles.filter(a => a.status === 'Published');
    return delay(ok(published));
  }

  public async getArticleById(pageId: number): Promise<Result<IArticlePage>> {
    const article = this.articles.find(a => a.id === pageId);
    if (!article) {
      return delay(fail({ code: 'NOT_FOUND', message: `Article ${pageId} not found` }));
    }
    return delay(ok(article));
  }
}
