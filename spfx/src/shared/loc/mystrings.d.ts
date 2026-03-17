declare interface ISharedStrings {
  // Buttons
  MarkAsRead: string;
  Save: string;
  Cancel: string;
  Delete: string;
  Edit: string;
  Close: string;
  Export: string;
  Submit: string;

  // Favorite actions
  RemoveFavorite: string;
  AddFavorite: string;

  // Statuses
  StatusDraft: string;
  StatusInReview: string;
  StatusPublished: string;
  StatusArchived: string;

  // Labels
  Category: string;
  TargetGroup: string;
  TargetGroups: string;
  Status: string;
  Author: string;
  LastUpdated: string;
  Version: string;

  // Messages
  Loading: string;
  NoResults: string;
  ErrorLoading: string;
  MandatoryArticle: string;

  // Error fallback
  ErrorOccurred: string;
  Reload: string;

  // Misc
  NotAssigned: string;
  OpenArticle: string;

  // Filter strings
  SearchPlaceholder: string;
  AllFilter: string;
  ClearFilters: string;

  // Relative date strings
  JustNow: string;
  SecondsAgo: string;
  OneMinuteAgo: string;
  MinutesAgo: string;
  OneHourAgo: string;
  HoursAgo: string;
  Yesterday: string;
  DaysAgo: string;
  OneMonthAgo: string;
  MonthsAgo: string;
  InSeconds: string;
  InOneMinute: string;
  InMinutes: string;
  InOneHour: string;
  InHours: string;
  Tomorrow: string;
  InDays: string;
  InOneMonth: string;
  InMonths: string;
}

declare module 'SharedStrings' {
  const strings: ISharedStrings;
  export = strings;
}
