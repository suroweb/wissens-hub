using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface IArticleMetadataRepository
{
    Task<ArticleMetadata?> GetByPageIdAsync(int pageId, CancellationToken ct);
    Task<ArticleMetadata?> GetByPageIdWithTargetGroupsAsync(int pageId, CancellationToken ct);
    Task<List<ArticleMetadata>> GetByStatusAsync(string status, CancellationToken ct);
    Task<List<ArticleMetadata>> GetAllWithCategoryAsync(CancellationToken ct);
    Task<int> GetPendingReviewCountAsync(CancellationToken ct);
    Task AddAsync(ArticleMetadata entity, CancellationToken ct);
    void Update(ArticleMetadata entity);
}
