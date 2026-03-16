using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class ReadConfirmationRepository(WissensHubDbContext db) : IReadConfirmationRepository
{
    public Task<ReadConfirmation?> GetByPageAndUserAsync(int pageId, string userId, CancellationToken ct)
        => db.ReadConfirmations.FirstOrDefaultAsync(r => r.PageId == pageId && r.UserId == userId, ct);

    public Task<List<ReadConfirmation>> GetByPageIdAsync(int pageId, CancellationToken ct)
        => db.ReadConfirmations.Where(r => r.PageId == pageId).ToListAsync(ct);

    public Task<List<ReadConfirmation>> GetByUserIdAsync(string userId, CancellationToken ct)
        => db.ReadConfirmations.Where(r => r.UserId == userId).ToListAsync(ct);

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken ct)
    {
        var totalMandatory = await db.ArticleMetadata.CountAsync(a => a.IsMandatory && a.Status == "Published", ct);
        var readCount = await db.ReadConfirmations.CountAsync(r => r.UserId == userId, ct);
        return Math.Max(0, totalMandatory - readCount);
    }

    public Task<bool> ExistsAsync(int pageId, string userId, CancellationToken ct)
        => db.ReadConfirmations.AnyAsync(r => r.PageId == pageId && r.UserId == userId, ct);

    public async Task AddAsync(ReadConfirmation entity, CancellationToken ct)
        => await db.ReadConfirmations.AddAsync(entity, ct);

    public Task DeleteByPageIdAsync(int pageId, CancellationToken ct)
        => db.ReadConfirmations.Where(r => r.PageId == pageId).ExecuteDeleteAsync(ct);
}
