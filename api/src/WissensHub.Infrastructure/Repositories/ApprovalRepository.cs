using Microsoft.EntityFrameworkCore;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Infrastructure.Repositories;

public class ApprovalRepository(WissensHubDbContext db) : IApprovalRepository
{
    public Task<List<ApprovalHistory>> GetByPageIdAsync(int pageId, CancellationToken ct)
        => db.ApprovalHistory.Where(a => a.PageId == pageId).OrderByDescending(a => a.ActionDate).ToListAsync(ct);

    public Task<ApprovalHistory?> GetLatestByPageIdAsync(int pageId, CancellationToken ct)
        => db.ApprovalHistory.Where(a => a.PageId == pageId).OrderByDescending(a => a.ActionDate).FirstOrDefaultAsync(ct);

    public async Task AddAsync(ApprovalHistory entity, CancellationToken ct)
        => await db.ApprovalHistory.AddAsync(entity, ct);
}
