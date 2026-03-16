import { IFavoriteService } from '../../interfaces/IFavoriteService';
import { IFavorite } from '../../models/domain/IFavorite';
import { Result, ok } from '../../models/Result';
import { MOCK_FAVORITES, delay } from './mockData';

export class MockFavoriteService implements IFavoriteService {
  private readonly favorites: IFavorite[];

  public constructor() {
    this.favorites = [...MOCK_FAVORITES];
  }

  public async getFavorites(): Promise<Result<IFavorite[]>> {
    return delay(ok([...this.favorites]));
  }

  public async toggleFavorite(pageId: number): Promise<Result<{ isFavorited: boolean }>> {
    const index = this.favorites.findIndex(
      f => f.pageId === pageId && f.userId === 'mock-user-id'
    );
    if (index >= 0) {
      this.favorites.splice(index, 1);
      return delay(ok({ isFavorited: false }));
    }
    this.favorites.push({
      pageId,
      userId: 'mock-user-id',
      favoritedDate: new Date(),
    });
    return delay(ok({ isFavorited: true }));
  }
}
