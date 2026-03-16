import { IApiClient } from '../interfaces/IApiClient';
import { IReadConfirmationService } from '../interfaces/IReadConfirmationService';
import { IReadConfirmation } from '../models/domain/IReadConfirmation';
import { ReadConfirmationDto } from '../models/dto/ReadConfirmationDto';
import { Result, ok } from '../models/Result';
import { toReadConfirmation } from '../mappers/readConfirmationMapper';

export class ReadConfirmationService implements IReadConfirmationService {
  public constructor(private readonly api: IApiClient) {}

  public async getReadStatus(pageId: number): Promise<Result<IReadConfirmation | undefined>> {
    const result = await this.api.get<{ readConfirmation: ReadConfirmationDto | undefined }>(
      `/api/articles/${pageId}/status`
    );
    if (!result.success) return result;
    const dto = result.data.readConfirmation;
    return ok(dto ? toReadConfirmation(dto) : undefined);
  }

  public async markAsRead(pageId: number): Promise<Result<void>> {
    return this.api.post(`/api/articles/${pageId}/read`);
  }

  public async getReadStats(pageId: number): Promise<Result<IReadConfirmation[]>> {
    const result = await this.api.get<ReadConfirmationDto[]>(
      `/api/articles/${pageId}/readstats`
    );
    if (!result.success) return result;
    return ok(result.data.map(toReadConfirmation));
  }
}
