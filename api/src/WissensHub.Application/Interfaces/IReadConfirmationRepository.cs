using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface IReadConfirmationRepository
{
    Task<ReadConfirmation?> GetByPageAndUserAsync(int pageId, string userId, CancellationToken ct);
    Task<List<ReadConfirmation>> GetByPageIdAsync(int pageId, CancellationToken ct);
    Task<List<ReadConfirmation>> GetByUserIdAsync(string userId, CancellationToken ct);
    Task<int> GetUnreadCountAsync(string userId, CancellationToken ct);
    Task<bool> ExistsAsync(int pageId, string userId, CancellationToken ct);
    Task AddAsync(ReadConfirmation entity, CancellationToken ct);
    Task DeleteByPageIdAsync(int pageId, CancellationToken ct);
}
