import { IApiClient } from '../interfaces/IApiClient';
import { IFlagService } from '../interfaces/IFlagService';
import { IFlag } from '../models/domain/IFlag';
import { Result } from '../models/Result';

export class FlagService implements IFlagService {
  public constructor(private readonly api: IApiClient) {}

  public async flagArticle(pageId: number, reason: string): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/flag`, { reason });
  }

  public async getFlaggedArticles(): Promise<Result<IFlag[]>> {
    return this.api.get('/api/articles/flagged');
  }
}
