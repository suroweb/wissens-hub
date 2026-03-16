import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { IPageService } from '../interfaces/IPageService';
import { IArticlePage } from '../models/domain/IArticlePage';
import { ArticlePageDto } from '../models/dto/ArticlePageDto';
import { Result, ok, fail } from '../models/Result';
import { toArticlePage } from '../mappers/articleMapper';

export class SharePointPageService implements IPageService {
  public constructor(private readonly sp: SPFI) {}

  public async getPublishedArticles(): Promise<Result<IArticlePage[]>> {
    try {
      const items = await this.sp.web.lists
        .getByTitle('SitePages')
        .items
        .select(
          'Id', 'Title', 'FileLeafRef', 'Modified', 'FileRef',
          'FieldValuesAsText/WH_Category', 'FieldValuesAsText/WH_Status',
          'FieldValuesAsText/WH_IsMandatory', 'FieldValuesAsText/WH_TargetGroups',
          'FieldValuesAsText/WH_Reviewer', 'FieldValuesAsText/WH_ReviewByDate',
          'Author/Title', 'Author/EMail'
        )
        .expand('FieldValuesAsText', 'Author')
        .filter("FieldValuesAsText/WH_Status eq 'Published'")
        .orderBy('Modified', false)
        .top(100)() as ArticlePageDto[];

      return ok(items.map(toArticlePage));
    } catch (e) {
      return fail({ code: 'NETWORK_ERROR', message: (e as Error).message });
    }
  }

  public async getArticleById(pageId: number): Promise<Result<IArticlePage>> {
    try {
      const item = await this.sp.web.lists
        .getByTitle('SitePages')
        .items
        .getById(pageId)
        .select(
          'Id', 'Title', 'FileLeafRef', 'Modified', 'FileRef',
          'FieldValuesAsText/WH_Category', 'FieldValuesAsText/WH_Status',
          'FieldValuesAsText/WH_IsMandatory', 'FieldValuesAsText/WH_TargetGroups',
          'FieldValuesAsText/WH_Reviewer', 'FieldValuesAsText/WH_ReviewByDate',
          'Author/Title', 'Author/EMail'
        )
        .expand('FieldValuesAsText', 'Author')() as ArticlePageDto;

      return ok(toArticlePage(item));
    } catch (e) {
      const message = (e as Error).message;
      if (message.includes('404') || message.includes('does not exist')) {
        return fail({ code: 'NOT_FOUND', message: `Article ${pageId} not found` });
      }
      return fail({ code: 'NETWORK_ERROR', message });
    }
  }
}
