import { ReadConfirmationDto } from '../models/dto/ReadConfirmationDto';
import { IReadConfirmation } from '../models/domain/IReadConfirmation';

export function toReadConfirmation(dto: ReadConfirmationDto): IReadConfirmation {
  return {
    pageId: dto.pageId,
    userId: dto.userId,
    userDisplayName: dto.userDisplayName,
    readDate: new Date(dto.readDate),
    confirmedVersion: dto.contentVersion,
  };
}
