import { Result } from '../models/Result';

export interface ICategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface ITargetGroupConfig {
  id: number;
  name: string;
  sharePointGroupName: string;
  isActive: boolean;
}

export interface IArticleReport {
  pageId: number;
  title: string;
  status: string;
  category: string;
  readCount: number;
  targetUserCount: number;
  flagCount: number;
  lastUpdated: Date;
}

export interface IAdminReport {
  articles: IArticleReport[];
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  inReviewCount: number;
  flaggedCount: number;
}

export interface IUserReadStatus {
  userId: string;
  displayName: string;
  hasRead: boolean;
  readDate: Date | undefined;
}

export interface IDetailedReadStats {
  pageId: number;
  title: string;
  totalTargetUsers: number;
  readCount: number;
  unreadCount: number;
  users: IUserReadStatus[];
}

export interface IAdminService {
  getCategories(): Promise<Result<ICategory[]>>;
  createCategory(name: string, description: string): Promise<Result<ICategory>>;
  updateCategory(id: number, name: string, description: string, isActive: boolean): Promise<Result<ICategory>>;
  deleteCategory(id: number): Promise<Result<boolean>>;

  getTargetGroups(): Promise<Result<ITargetGroupConfig[]>>;
  createTargetGroup(name: string, sharePointGroupName: string): Promise<Result<ITargetGroupConfig>>;
  updateTargetGroup(id: number, name: string, isActive: boolean): Promise<Result<ITargetGroupConfig>>;
  deleteTargetGroup(id: number): Promise<Result<boolean>>;

  getReminderInterval(): Promise<Result<number>>;
  updateReminderInterval(days: number): Promise<Result<number>>;

  getAdminReports(): Promise<Result<IAdminReport>>;
  getDetailedReadStats(pageId: number): Promise<Result<IDetailedReadStats>>;
}
