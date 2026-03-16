import { IApiClient } from '../interfaces/IApiClient';
import { IFavoriteService } from '../interfaces/IFavoriteService';
import { IFavorite } from '../models/domain/IFavorite';
import { FavoriteDto } from '../models/dto/FavoriteDto';
import { Result, ok } from '../models/Result';
import { toFavorite } from '../mappers/favoriteMapper';

export class FavoriteService implements IFavoriteService {
  public constructor(private readonly api: IApiClient) {}

  public async getFavorites(): Promise<Result<IFavorite[]>> {
    const result = await this.api.get<FavoriteDto[]>('/api/favorites');
    if (!result.success) return result;
    return ok(result.data.map(toFavorite));
  }

  public async toggleFavorite(pageId: number): Promise<Result<{ isFavorited: boolean }>> {
    return this.api.post(`/api/favorites/${pageId}`);
  }
}
