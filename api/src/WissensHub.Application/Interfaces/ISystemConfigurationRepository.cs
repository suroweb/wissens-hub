using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface ISystemConfigurationRepository
{
    Task<SystemConfiguration?> GetByKeyAsync(string key, CancellationToken ct);
    Task AddAsync(SystemConfiguration entity, CancellationToken ct);
    void Update(SystemConfiguration entity);
}
