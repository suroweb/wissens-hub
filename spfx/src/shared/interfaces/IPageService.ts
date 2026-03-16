import { Result } from '../models/Result';
import { IArticlePage } from '../models/domain/IArticlePage';

export interface IPageService {
  getPublishedArticles(): Promise<Result<IArticlePage[]>>;
  getArticleById(pageId: number): Promise<Result<IArticlePage>>;
}
