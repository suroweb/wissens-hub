import { FavoriteDto } from '../models/dto/FavoriteDto';
import { IFavorite } from '../models/domain/IFavorite';

export function toFavorite(dto: FavoriteDto): IFavorite {
  return {
    pageId: dto.pageId,
    userId: dto.userId,
    favoritedDate: new Date(dto.favoritedDate),
  };
}
