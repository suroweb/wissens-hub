export interface ApprovalDto {
  id: number;
  pageId: number;
  actionBy: string;
  actionByDisplayName: string;
  actionDate: string;
  fromStatus: string;
  toStatus: string;
  comment?: string;
}
