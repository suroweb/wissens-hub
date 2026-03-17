import {
  IAdminService,
  ICategory,
  ITargetGroupConfig,
  IAdminReport,
  IDetailedReadStats,
} from '../../interfaces/IAdminService';
import { Result, ok } from '../../models/Result';
import {
  MOCK_ADMIN_CATEGORIES,
  MOCK_ADMIN_TARGET_GROUPS,
  MOCK_ADMIN_USERS,
  MOCK_ARTICLES,
  delay,
} from './mockData';

export class MockAdminService implements IAdminService {
  private categories: ICategory[];
  private targetGroups: ITargetGroupConfig[];
  private reminderInterval: number;
  private nextCategoryId: number;
  private nextTargetGroupId: number;

  public constructor() {
    this.categories = MOCK_ADMIN_CATEGORIES.map(c => ({ ...c }));
    this.targetGroups = MOCK_ADMIN_TARGET_GROUPS.map(g => ({ ...g }));
    this.reminderInterval = 7;
    this.nextCategoryId = this.categories.length + 1;
    this.nextTargetGroupId = this.targetGroups.length + 1;
  }

  public async getCategories(): Promise<Result<ICategory[]>> {
    return delay(ok(this.categories.map(c => ({ ...c }))));
  }

  public async createCategory(name: string, description: string): Promise<Result<ICategory>> {
    const category: ICategory = {
      id: this.nextCategoryId++,
      name,
      description,
      isActive: true,
    };
    this.categories.push(category);
    return delay(ok({ ...category }));
  }

  public async updateCategory(id: number, name: string, description: string, isActive: boolean): Promise<Result<ICategory>> {
    const idx = this.categories.findIndex(c => c.id === id);
    if (idx >= 0) {
      this.categories[idx] = { ...this.categories[idx], name, description, isActive };
      return delay(ok({ ...this.categories[idx] }));
    }
    return delay(ok({ id, name, description, isActive }));
  }

  public async deleteCategory(id: number): Promise<Result<boolean>> {
    this.categories = this.categories.filter(c => c.id !== id);
    return delay(ok(true));
  }

  public async getTargetGroups(): Promise<Result<ITargetGroupConfig[]>> {
    return delay(ok(this.targetGroups.map(g => ({ ...g }))));
  }

  public async createTargetGroup(name: string, sharePointGroupName: string): Promise<Result<ITargetGroupConfig>> {
    const group: ITargetGroupConfig = {
      id: this.nextTargetGroupId++,
      name,
      sharePointGroupName,
      isActive: true,
    };
    this.targetGroups.push(group);
    return delay(ok({ ...group }));
  }

  public async updateTargetGroup(id: number, name: string, isActive: boolean): Promise<Result<ITargetGroupConfig>> {
    const idx = this.targetGroups.findIndex(g => g.id === id);
    if (idx >= 0) {
      this.targetGroups[idx] = { ...this.targetGroups[idx], name, isActive };
      return delay(ok({ ...this.targetGroups[idx] }));
    }
    return delay(ok({ id, name, sharePointGroupName: '', isActive }));
  }

  public async deleteTargetGroup(id: number): Promise<Result<boolean>> {
    this.targetGroups = this.targetGroups.filter(g => g.id !== id);
    return delay(ok(true));
  }

  public async getReminderInterval(): Promise<Result<number>> {
    return delay(ok(this.reminderInterval));
  }

  public async updateReminderInterval(days: number): Promise<Result<number>> {
    this.reminderInterval = days;
    return delay(ok(days));
  }

  public async getAdminReports(): Promise<Result<IAdminReport>> {
    const articles = MOCK_ARTICLES;
    const published = articles.filter(a => a.status === 'Published');
    const drafts = articles.filter(a => a.status === 'Draft');
    const inReview = articles.filter(a => a.status === 'InReview');

    const report: IAdminReport = {
      articles: articles.map(a => ({
        pageId: a.id,
        title: a.title,
        status: a.status,
        category: a.category,
        readCount: Math.floor(Math.random() * 50),
        targetUserCount: 50,
        flagCount: 0,
        lastUpdated: a.modifiedDate,
      })),
      totalArticles: articles.length,
      publishedCount: published.length,
      draftCount: drafts.length,
      inReviewCount: inReview.length,
      flaggedCount: 1,
    };
    return delay(ok(report));
  }

  public async getDetailedReadStats(pageId: number): Promise<Result<IDetailedReadStats>> {
    const users = MOCK_ADMIN_USERS.map((user, idx) => ({
      userId: 'user-' + (idx + 1),
      displayName: user,
      hasRead: idx < 3,
      readDate: idx < 3 ? new Date('2026-03-01T10:00:00Z') : undefined,
    }));

    return delay(ok({
      pageId,
      title: 'Article ' + pageId,
      totalTargetUsers: 5,
      readCount: 3,
      unreadCount: 2,
      users,
    }));
  }
}
