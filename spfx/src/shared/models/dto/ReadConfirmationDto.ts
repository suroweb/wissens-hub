export interface ReadConfirmationDto {
  pageId: number;
  userId: string;
  userDisplayName: string;
  readDate: string;
  contentVersion?: number; // maps to backend ReadConfirmationDto.ContentVersion
}
