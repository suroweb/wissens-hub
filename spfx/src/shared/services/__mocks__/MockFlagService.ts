import { IFlagService } from '../../interfaces/IFlagService';
import { IFlag } from '../../models/domain/IFlag';
import { Result, ok } from '../../models/Result';
import { MOCK_FLAGS, delay } from './mockData';

export class MockFlagService implements IFlagService {
  private readonly flags: IFlag[];

  public constructor() {
    this.flags = [...MOCK_FLAGS];
  }

  public async flagArticle(pageId: number, reason: string): Promise<Result<void>> {
    this.flags.push({
      id: this.flags.length + 1,
      pageId,
      userId: 'mock-user-id',
      userDisplayName: 'Max Mustermann',
      reason,
      flaggedDate: new Date(),
    });
    return delay(ok(undefined as unknown as void));
  }

  public async getFlaggedArticles(): Promise<Result<IFlag[]>> {
    return delay(ok([...this.flags]));
  }
}
