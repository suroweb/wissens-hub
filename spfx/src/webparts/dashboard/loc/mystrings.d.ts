declare interface IDashboardWebPartStrings {
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

  // StatsBar
  Unread: string;
  Favorites: string;
  OpenForReview: string;

  // FilterBar
  CategoryPlaceholder: string;
  StatusPlaceholder: string;
  TargetGroupPlaceholder: string;
  CardView: string;
  ListView: string;
  NewArticle: string;
  RemoveFilterLabel: string;
  SearchPlaceholder: string;
  ClearFilters: string;

  // EmptyState
  NoResultsFor: string;
  NoFilterMatch: string;
  EmptyHub: string;

  // ArticleListView columns
  ColumnTitle: string;
  ColumnCategory: string;
  ColumnAuthor: string;
  ColumnModified: string;

  // Dashboard error
  ErrorLoadingArticles: string;
}

declare module 'DashboardWebPartStrings' {
  const strings: IDashboardWebPartStrings;
  export = strings;
}
