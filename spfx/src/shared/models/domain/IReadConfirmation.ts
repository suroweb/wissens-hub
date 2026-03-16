export interface IReadConfirmation {
  pageId: number;
  userId: string;
  userDisplayName: string;
  readDate: Date;
  confirmedVersion?: number; // content version at time of read confirmation (maps to backend ContentVersion)
}
