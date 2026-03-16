import { ApprovalDto } from '../models/dto/ApprovalDto';
import { IApprovalAction } from '../models/domain/IApprovalAction';
import { ArticleStatus } from '../models/domain/types';

export function toApprovalAction(dto: ApprovalDto): IApprovalAction {
  return {
    id: dto.id,
    pageId: dto.pageId,
    actionBy: dto.actionBy,
    actionByDisplayName: dto.actionByDisplayName,
    actionDate: new Date(dto.actionDate),
    fromStatus: dto.fromStatus as ArticleStatus,
    toStatus: dto.toStatus as ArticleStatus,
    comment: dto.comment ?? undefined,
  };
}
