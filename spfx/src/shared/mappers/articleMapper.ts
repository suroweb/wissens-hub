import { ArticlePageDto } from '../models/dto/ArticlePageDto';
import { IArticlePage } from '../models/domain/IArticlePage';
import { ArticleStatus } from '../models/domain/types';

export function toArticlePage(dto: ArticlePageDto): IArticlePage {
  const fv = dto.FieldValuesAsText;
  return {
    id: dto.Id,
    title: dto.Title,
    category: fv.WH_Category || '',
    status: (fv.WH_Status as ArticleStatus) || 'Draft',
    isMandatory: parseBooleanField(fv.WH_IsMandatory),
    targetGroups: fv.WH_TargetGroups
      ? fv.WH_TargetGroups.split(';').map(s => s.trim()).filter(Boolean)
      : [],
    modifiedDate: new Date(dto.Modified),
    author: { displayName: dto.Author.Title, email: dto.Author.EMail },
    reviewerName: fv.WH_Reviewer || undefined,
    reviewByDate: fv.WH_ReviewByDate ? new Date(fv.WH_ReviewByDate) : undefined,
    url: dto.FileRef || '',
  };
}

// Handle German locale ("Ja"/"Nein"), English ("Yes"/"No"), and raw boolean ("1"/"0", "true"/"false")
function parseBooleanField(value: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower === 'yes' || lower === 'ja' || lower === 'true' || lower === '1';
}
