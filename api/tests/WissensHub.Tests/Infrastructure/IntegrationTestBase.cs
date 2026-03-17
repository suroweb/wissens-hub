using Microsoft.Extensions.DependencyInjection;
using MediatR;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Tests.Infrastructure;

[Collection("Integration")]
public abstract class IntegrationTestBase
{
    protected readonly IntegrationTestFixture _fixture;

    protected IntegrationTestBase(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    protected IServiceScope CreateScope()
        => _fixture.ServiceProvider.CreateScope();

    protected IMediator GetMediator(IServiceScope scope)
        => scope.ServiceProvider.GetRequiredService<IMediator>();

    protected WissensHubDbContext GetDbContext(IServiceScope scope)
        => scope.ServiceProvider.GetRequiredService<WissensHubDbContext>();

    protected async Task CleanupAsync()
    {
        using var scope = CreateScope();
        var db = GetDbContext(scope);

        // Remove all data in correct order (respecting FK constraints)
        db.ArticleTargetGroups.RemoveRange(db.ArticleTargetGroups);
        db.ApprovalHistory.RemoveRange(db.ApprovalHistory);
        db.ArticleFlags.RemoveRange(db.ArticleFlags);
        db.ReadConfirmations.RemoveRange(db.ReadConfirmations);
        db.Favorites.RemoveRange(db.Favorites);
        db.ArticleMetadata.RemoveRange(db.ArticleMetadata);
        db.Categories.RemoveRange(db.Categories);
        db.TargetGroups.RemoveRange(db.TargetGroups);
        db.SystemConfigurations.RemoveRange(db.SystemConfigurations);

        await db.SaveChangesAsync();
    }

    protected ArticleMetadata SeedArticle(WissensHubDbContext db, int pageId, string title, string status)
    {
        var article = new ArticleMetadata
        {
            PageId = pageId,
            Status = status,
            IsMandatory = false,
            ContentVersion = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.ArticleMetadata.Add(article);
        return article;
    }
}
