using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface IFlagRepository
{
    Task<ArticleFlag?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<ArticleFlag>> GetByPageIdAsync(int pageId, CancellationToken ct);
    Task<List<ArticleFlag>> GetUnresolvedAsync(CancellationToken ct);
    Task AddAsync(ArticleFlag entity, CancellationToken ct);
}
