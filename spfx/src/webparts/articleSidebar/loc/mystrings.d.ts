declare interface IArticleSidebarWebPartStrings {
  // Scaffold strings
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;

  // ArticleSidebar
  ErrorLoadingArticleData: string;
  VersionHistory: string;

  // MetadataSection
  EditMetadata: string;

  // ReadStatusSection
  MandatoryReadRequired: string;
  ArticleUpdatedReconfirm: string;
  PreviouslyReadOn: string;
  ReconfirmReading: string;
  ReadOn: string;
  ReportedOn: string;
  ReportAsOutdated: string;

  // FlagDialog
  FlagDialogTitle: string;
  FlagDialogSubText: string;
  ReasonLabel: string;

  // TableOfContents
  TableOfContents: string;

  // ApprovalActions
  SubmitForReview: string;
  Archive: string;
  Restore: string;
  SubmittedForReview: string;
  ArticleArchived: string;
  ArticleRestored: string;

  // ApprovalHistory
  ApprovalHistoryTitle: string;
  NoActionsYet: string;
  ErrorLoadingHistory: string;
  ActionApproved: string;
  ActionRestored: string;
  ActionRejected: string;
  ActionSubmitted: string;
  ActionArchived: string;
  ActionByUser: string;
}

declare module 'ArticleSidebarWebPartStrings' {
  const strings: IArticleSidebarWebPartStrings;
  export = strings;
}
