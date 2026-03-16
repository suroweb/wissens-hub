import { ArticleStatus } from './types';

export interface IApprovalAction {
  id: number;
  pageId: number;
  actionBy: string;
  actionByDisplayName: string;
  actionDate: Date;
  fromStatus: ArticleStatus;
  toStatus: ArticleStatus;
  comment?: string;
}
