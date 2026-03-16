using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class ArticleMetadataRepository(WissensHubDbContext db) : IArticleMetadataRepository
{
    public Task<ArticleMetadata?> GetByPageIdAsync(int pageId, CancellationToken ct)
        => db.ArticleMetadata.FirstOrDefaultAsync(a => a.PageId == pageId, ct);

    public Task<ArticleMetadata?> GetByPageIdWithTargetGroupsAsync(int pageId, CancellationToken ct)
        => db.ArticleMetadata
            .Include(a => a.ArticleTargetGroups).ThenInclude(atg => atg.TargetGroup)
            .Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.PageId == pageId, ct);

    public Task<List<ArticleMetadata>> GetByStatusAsync(string status, CancellationToken ct)
        => db.ArticleMetadata
            .Where(a => a.Status == status)
            .Include(a => a.Category)
            .OrderByDescending(a => a.UpdatedAt)
            .ToListAsync(ct);

    public Task<List<ArticleMetadata>> GetAllWithCategoryAsync(CancellationToken ct)
        => db.ArticleMetadata
            .Include(a => a.Category)
            .OrderByDescending(a => a.UpdatedAt)
            .ToListAsync(ct);

    public Task<int> GetPendingReviewCountAsync(CancellationToken ct)
        => db.ArticleMetadata.CountAsync(a => a.Status == "InReview", ct);

    public async Task AddAsync(ArticleMetadata entity, CancellationToken ct)
        => await db.ArticleMetadata.AddAsync(entity, ct);

    public void Update(ArticleMetadata entity)
        => db.ArticleMetadata.Update(entity);
}
