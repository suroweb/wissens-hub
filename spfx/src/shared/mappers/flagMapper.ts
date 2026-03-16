import { FlagDto } from '../models/dto/FlagDto';
import { IFlag } from '../models/domain/IFlag';

export function toFlag(dto: FlagDto): IFlag {
  return {
    id: dto.id,
    pageId: dto.pageId,
    userId: dto.userId,
    userDisplayName: dto.userDisplayName,
    reason: dto.reason,
    flaggedDate: new Date(dto.flaggedDate),
  };
}
