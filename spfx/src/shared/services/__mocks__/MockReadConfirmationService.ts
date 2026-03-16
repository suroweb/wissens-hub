import { IReadConfirmationService } from '../../interfaces/IReadConfirmationService';
import { IReadConfirmation } from '../../models/domain/IReadConfirmation';
import { Result, ok } from '../../models/Result';
import { MOCK_READ_CONFIRMATIONS, delay } from './mockData';

export class MockReadConfirmationService implements IReadConfirmationService {
  private readonly readConfirmations: IReadConfirmation[];

  public constructor() {
    this.readConfirmations = [...MOCK_READ_CONFIRMATIONS];
  }

  public async getReadStatus(pageId: number): Promise<Result<IReadConfirmation | undefined>> {
    const match = this.readConfirmations.find(
      rc => rc.pageId === pageId && rc.userId === 'mock-user-id'
    );
    return delay(ok(match));
  }

  public async markAsRead(pageId: number): Promise<Result<void>> {
    const existing = this.readConfirmations.find(
      rc => rc.pageId === pageId && rc.userId === 'mock-user-id'
    );
    if (!existing) {
      this.readConfirmations.push({
        pageId,
        userId: 'mock-user-id',
        userDisplayName: 'Max Mustermann',
        readDate: new Date(),
      });
    }
    return delay(ok(undefined as unknown as void));
  }

  public async getReadStats(pageId: number): Promise<Result<IReadConfirmation[]>> {
    const stats = this.readConfirmations.filter(rc => rc.pageId === pageId);
    return delay(ok(stats));
  }
}
