import { ArticleStatus } from './types';
import { IUser } from './IUser';

export interface IArticlePage {
  id: number;
  title: string;
  category: string;
  status: ArticleStatus;
  isMandatory: boolean;
  targetGroups: string[];
  modifiedDate: Date;
  author: IUser;
  reviewerName?: string;
  reviewByDate?: Date;
  url: string;
}
