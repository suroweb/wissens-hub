using Microsoft.EntityFrameworkCore;
using WissensHub.Domain.Entities;

namespace WissensHub.Infrastructure.Data;

public class WissensHubDbContext : DbContext
{
    public WissensHubDbContext(DbContextOptions<WissensHubDbContext> options)
        : base(options) { }

    public DbSet<ArticleMetadata> ArticleMetadata => Set<ArticleMetadata>();
    public DbSet<ReadConfirmation> ReadConfirmations => Set<ReadConfirmation>();
    public DbSet<ArticleFlag> ArticleFlags => Set<ArticleFlag>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<ApprovalHistory> ApprovalHistory => Set<ApprovalHistory>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<TargetGroup> TargetGroups => Set<TargetGroup>();
    public DbSet<ArticleTargetGroup> ArticleTargetGroups => Set<ArticleTargetGroup>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WissensHubDbContext).Assembly);
    }
}
