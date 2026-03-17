declare interface IAdminPanelWebPartStrings {
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
  AdminPanelTitle: string;

  // Tabs
  TabOverview: string;
  TabCategories: string;
  TabTargetGroups: string;
  TabReports: string;

  // UebersichtTab
  StatusFilter: string;
  StatsTotal: string;
  StatsFlagged: string;
  Freshness: string;
  FreshnessGreen: string;
  FreshnessYellow: string;
  FreshnessRed: string;
  Flags: string;
  ReminderIntervalTitle: string;
  ReminderIntervalHelp: string;
  IntervalSaved: string;
  ErrorSavingInterval: string;
  ErrorLoadingOverview: string;
  DaysUnit: string;

  // KategorienTab
  CategoryNamePlaceholder: string;
  DescriptionPlaceholder: string;
  ErrorSavingCategory: string;
  ErrorUpdatingCategoryStatus: string;
  ErrorCreatingCategory: string;
  ErrorDeletingCategory: string;
  ErrorLoadingCategories: string;

  // ZielgruppenTab
  TargetGroupNamePlaceholder: string;
  SharePointGroup: string;
  SelectSharePointGroup: string;
  ErrorLoadingSPGroups: string;
  ErrorSavingTargetGroup: string;
  ErrorCreatingTargetGroup: string;
  ErrorDeletingTargetGroup: string;
  ErrorLoadingTargetGroups: string;

  // BerichteTab
  ReadQuota: string;
  ErrorLoadingReports: string;

  // ReadReportDrilldown
  BackToOverview: string;
  ReadDate: string;
  UsersHaveRead: string;
  ErrorLoadingReadDetails: string;
}

declare module 'AdminPanelWebPartStrings' {
  const strings: IAdminPanelWebPartStrings;
  export = strings;
}
