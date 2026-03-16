import { Result } from '../models/Result';
import { IFavorite } from '../models/domain/IFavorite';

export interface IFavoriteService {
  getFavorites(): Promise<Result<IFavorite[]>>;
  toggleFavorite(pageId: number): Promise<Result<{ isFavorited: boolean }>>;
}
