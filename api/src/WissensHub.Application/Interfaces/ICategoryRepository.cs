using WissensHub.Domain.Entities;

namespace WissensHub.Application.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(int id, CancellationToken ct);
    Task<List<Category>> GetAllAsync(CancellationToken ct);
    Task<List<Category>> GetAllActiveAsync(CancellationToken ct);
    Task<List<TargetGroup>> GetAllActiveTargetGroupsAsync(CancellationToken ct);
    Task AddCategoryAsync(Category entity, CancellationToken ct);
    void UpdateCategory(Category entity);
    void RemoveCategory(Category entity);
}
