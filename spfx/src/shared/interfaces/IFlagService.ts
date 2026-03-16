import { Result } from '../models/Result';
import { IFlag } from '../models/domain/IFlag';

export interface IFlagService {
  flagArticle(pageId: number, reason: string): Promise<Result<void>>;
  getFlaggedArticles(): Promise<Result<IFlag[]>>;
}
