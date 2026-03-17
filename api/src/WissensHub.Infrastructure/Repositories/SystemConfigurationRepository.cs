using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class SystemConfigurationRepository(WissensHubDbContext db) : ISystemConfigurationRepository
{
    public Task<SystemConfiguration?> GetByKeyAsync(string key, CancellationToken ct)
        => db.SystemConfigurations.FirstOrDefaultAsync(s => s.Key == key, ct);

    public async Task AddAsync(SystemConfiguration entity, CancellationToken ct)
        => await db.SystemConfigurations.AddAsync(entity, ct);

    public void Update(SystemConfiguration entity)
        => db.SystemConfigurations.Update(entity);
}
