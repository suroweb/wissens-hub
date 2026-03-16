import { IApiClient } from '../interfaces/IApiClient';
import { IFlagService } from '../interfaces/IFlagService';
import { Result } from '../models/Result';

export class FlagService implements IFlagService {
  public constructor(private readonly api: IApiClient) {}

  public async flagArticle(pageId: number, reason: string): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/flag`, { reason });
  }
}
