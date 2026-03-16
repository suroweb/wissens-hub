import { Result } from '../models/Result';

export interface IFlagService {
  flagArticle(pageId: number, reason: string): Promise<Result<void>>;
}
