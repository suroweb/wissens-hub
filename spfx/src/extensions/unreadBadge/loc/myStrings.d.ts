declare interface IUnreadBadgeApplicationCustomizerStrings {
  Title: string;
  UnreadArticlesAriaLabel: string;
  UnreadArticlesHeader: string;
  LoadingUnreadArticles: string;
  AllArticlesRead: string;
  ShowAll: string;
  ClosePanel: string;
}

declare module 'UnreadBadgeApplicationCustomizerStrings' {
  const strings: IUnreadBadgeApplicationCustomizerStrings;
  export = strings;
}
