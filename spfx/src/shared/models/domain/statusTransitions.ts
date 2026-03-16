import { ArticleStatus } from './types';

// Valid transitions map: key = current status, value = list of allowed next statuses
export const VALID_TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  'Draft': ['InReview'],
  'InReview': ['Published', 'Draft'],
  'Published': ['Archived'],
  'Archived': ['Published'],
};

export function isValidTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed !== undefined && allowed.indexOf(to) >= 0;
}
