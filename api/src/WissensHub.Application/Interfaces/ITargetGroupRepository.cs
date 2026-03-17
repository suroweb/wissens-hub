using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface ITargetGroupRepository
{
    Task<TargetGroup?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<TargetGroup>> GetAllAsync(CancellationToken ct);
    Task<List<TargetGroup>> GetAllActiveAsync(CancellationToken ct);
    Task AddAsync(TargetGroup entity, CancellationToken ct);
    void Update(TargetGroup entity);
    void Remove(TargetGroup entity);
}
