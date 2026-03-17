declare interface IFreigabecenterWebPartStrings {
  // Scaffold strings
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;

  // Environment strings
  AppLocalEnvironmentSharePoint: string;
  AppSharePointEnvironment: string;
  AppLocalEnvironmentTeams: string;
  AppTeamsTabEnvironment: string;
  AppLocalEnvironmentOffice: string;
  AppOfficeEnvironment: string;
  AppLocalEnvironmentOutlook: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;

  // Header
  FreigabecenterTitle: string;

  // Tabs
  TabPending: string;
  TabFlagged: string;
  TabStale: string;

  // Reviewer filter
  ReviewerLabel: string;
  AllReviewers: string;

  // ApprovalCard
  ReviewerPrefix: string;
  Approve: string;
  Reject: string;

  // FlaggedCard
  FlaggedBy: string;

  // StaleCard
  LastModified: string;

  // ApproveDialog
  ApproveDialogTitle: string;
  CommentLabel: string;

  // RejectDialog
  RejectDialogTitle: string;
  ReasonLabel: string;

  // Errors
  ErrorLoadingFreigabecenter: string;
}

declare module 'FreigabecenterWebPartStrings' {
  const strings: IFreigabecenterWebPartStrings;
  export = strings;
}
