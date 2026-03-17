using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class TargetGroupRepository(WissensHubDbContext db) : ITargetGroupRepository
{
    public async Task<TargetGroup?> GetByIdAsync(int id, CancellationToken ct)
        => await db.TargetGroups.FindAsync([id], ct);

    public Task<List<TargetGroup>> GetAllAsync(CancellationToken ct)
        => db.TargetGroups.OrderBy(t => t.Name).ToListAsync(ct);

    public Task<List<TargetGroup>> GetAllActiveAsync(CancellationToken ct)
        => db.TargetGroups.Where(t => t.IsActive).OrderBy(t => t.Name).ToListAsync(ct);

    public async Task AddAsync(TargetGroup entity, CancellationToken ct)
        => await db.TargetGroups.AddAsync(entity, ct);

    public void Update(TargetGroup entity)
        => db.TargetGroups.Update(entity);

    public void Remove(TargetGroup entity)
        => db.TargetGroups.Remove(entity);
}
