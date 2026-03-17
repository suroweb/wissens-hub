/**
 * Frontend model for unread article items displayed in the flyout panel.
 */
export interface IUnreadArticle {
  pageId: number;
  title: string;
  category: string;
  isMandatory: boolean;
  updatedAt: Date;
  url: string;
}
