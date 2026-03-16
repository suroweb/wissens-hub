using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface IApprovalRepository
{
    Task<List<ApprovalHistory>> GetByPageIdAsync(int pageId, CancellationToken ct);
    Task<ApprovalHistory?> GetLatestByPageIdAsync(int pageId, CancellationToken ct);
    Task AddAsync(ApprovalHistory entity, CancellationToken ct);
}
