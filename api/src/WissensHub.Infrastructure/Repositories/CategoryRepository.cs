using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class CategoryRepository(WissensHubDbContext db) : ICategoryRepository
{
    public async Task<Category?> GetByIdAsync(int id, CancellationToken ct)
        => await db.Categories.FindAsync([id], ct);

    public Task<List<Category>> GetAllActiveAsync(CancellationToken ct)
        => db.Categories.Where(c => c.IsActive).OrderBy(c => c.Name).ToListAsync(ct);

    public Task<List<TargetGroup>> GetAllActiveTargetGroupsAsync(CancellationToken ct)
        => db.TargetGroups.Where(t => t.IsActive).OrderBy(t => t.Name).ToListAsync(ct);

    public async Task AddCategoryAsync(Category entity, CancellationToken ct)
        => await db.Categories.AddAsync(entity, ct);

    public void UpdateCategory(Category entity)
        => db.Categories.Update(entity);

    public void RemoveCategory(Category entity)
        => db.Categories.Remove(entity);
}
