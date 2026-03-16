export type ArticleStatus = 'Draft' | 'InReview' | 'Published' | 'Archived';

export type UserRole = 'reader' | 'editor' | 'reviewer' | 'admin';

export const ROLE_HIERARCHY: UserRole[] = ['reader', 'editor', 'reviewer', 'admin'];
