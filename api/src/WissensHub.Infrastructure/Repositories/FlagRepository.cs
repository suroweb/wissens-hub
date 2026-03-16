using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class FlagRepository(WissensHubDbContext db) : IFlagRepository
{
    public async Task<ArticleFlag?> GetByIdAsync(int id, CancellationToken ct)
        => await db.ArticleFlags.FindAsync([id], ct);

    public Task<List<ArticleFlag>> GetByPageIdAsync(int pageId, CancellationToken ct)
        => db.ArticleFlags.Where(f => f.PageId == pageId).OrderByDescending(f => f.FlaggedDate).ToListAsync(ct);

    public Task<List<ArticleFlag>> GetUnresolvedAsync(CancellationToken ct)
        => db.ArticleFlags.Where(f => !f.IsResolved).OrderByDescending(f => f.FlaggedDate).ToListAsync(ct);

    public async Task AddAsync(ArticleFlag entity, CancellationToken ct)
        => await db.ArticleFlags.AddAsync(entity, ct);
}
