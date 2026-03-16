using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class FavoriteRepository(WissensHubDbContext db) : IFavoriteRepository
{
    public Task<Favorite?> GetByPageAndUserAsync(int pageId, string userId, CancellationToken ct)
        => db.Favorites.FirstOrDefaultAsync(f => f.PageId == pageId && f.UserId == userId, ct);

    public Task<List<Favorite>> GetByUserIdAsync(string userId, CancellationToken ct)
        => db.Favorites.Where(f => f.UserId == userId).OrderByDescending(f => f.CreatedAt).ToListAsync(ct);

    public Task<bool> ExistsAsync(int pageId, string userId, CancellationToken ct)
        => db.Favorites.AnyAsync(f => f.PageId == pageId && f.UserId == userId, ct);

    public async Task AddAsync(Favorite entity, CancellationToken ct)
        => await db.Favorites.AddAsync(entity, ct);

    public void Remove(Favorite entity)
        => db.Favorites.Remove(entity);
}
