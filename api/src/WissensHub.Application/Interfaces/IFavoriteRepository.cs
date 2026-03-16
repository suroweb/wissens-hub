using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface IFavoriteRepository
{
    Task<Favorite?> GetByPageAndUserAsync(int pageId, string userId, CancellationToken ct);
    Task<List<Favorite>> GetByUserIdAsync(string userId, CancellationToken ct);
    Task<bool> ExistsAsync(int pageId, string userId, CancellationToken ct);
    Task AddAsync(Favorite entity, CancellationToken ct);
    void Remove(Favorite entity);
}
