using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WissensHub.Application.Common;
using WissensHub.Application.Queries.GetDetailedReadStats;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;
using WissensHub.Tests.Infrastructure;

namespace WissensHub.Tests.Endpoints;

public class ReadStatsEndpointTests : IntegrationTestBase
{
    public ReadStatsEndpointTests(IntegrationTestFixture fixture)
        : base(fixture)
    {
        CleanupAsync().GetAwaiter().GetResult();
    }

    // --- API-05 GetDetailedReadStats ---

    [Fact]
    public async Task GetDetailedReadStats_WithReadConfirmation_ReturnsReaderInfo()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        var article = SeedArticle(db, pageId: 100, title: "Test Article", status: "Published");
        await db.SaveChangesAsync();

        // Add a read confirmation
        db.ReadConfirmations.Add(new ReadConfirmation
        {
            ArticleMetadataId = article.Id,
            PageId = 100,
            UserId = "test-user-oid",
            UserDisplayName = "Test User",
            ReadDate = DateTime.UtcNow,
            ContentVersion = 1
        });
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act — GetDetailedReadStatsQuery uses real repositories (requires WissensHub Owners group)
        var result = await mediator.Send(new GetDetailedReadStatsQuery(100));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data!.PageId);
        Assert.Equal(1, result.Data.ReadCount);
        Assert.Single(result.Data.Users);
        Assert.Equal("test-user-oid", result.Data.Users[0].UserId);
        Assert.True(result.Data.Users[0].HasRead);
    }

    [Fact]
    public async Task GetDetailedReadStats_NoReaders_ReturnsEmptyUserList()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 200, title: "Unread Article", status: "Published");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetDetailedReadStatsQuery(200));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(200, result.Data!.PageId);
        Assert.Equal(0, result.Data.ReadCount);
        Assert.Empty(result.Data.Users);
    }

    [Fact]
    public async Task GetDetailedReadStats_NonExistentArticle_ThrowsKeyNotFound()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act & Assert — handler throws KeyNotFoundException for missing PageId
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => mediator.Send(new GetDetailedReadStatsQuery(99999)));
    }
}
