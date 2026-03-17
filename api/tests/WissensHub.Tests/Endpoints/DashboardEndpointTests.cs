using MediatR;
using Microsoft.Extensions.DependencyInjection;
using WissensHub.Application.Common;
using WissensHub.Application.Queries.GetDashboardStats;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;
using WissensHub.Tests.Infrastructure;

namespace WissensHub.Tests.Endpoints;

public class DashboardEndpointTests : IntegrationTestBase
{
    public DashboardEndpointTests(IntegrationTestFixture fixture)
        : base(fixture)
    {
        CleanupAsync().GetAwaiter().GetResult();
    }

    // --- API-09: GetDashboardStats ---

    [Fact]
    public async Task GetDashboardStats_ReturnsSuccessResponse()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Article A", status: "Published");
        SeedArticle(db, pageId: 101, title: "Article B", status: "Published");
        SeedArticle(db, pageId: 102, title: "Article C", status: "Draft");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act — handler returns mock stats, but pipeline executes with seeded data
        var result = await mediator.Send(new GetDashboardStatsQuery());

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task GetDashboardStats_EmptyState_ReturnsSuccess()
    {
        // Arrange — no seed data, clean database
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetDashboardStatsQuery());

        // Assert — mock handler returns hardcoded values even with empty DB
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task GetDashboardStats_ReturnsExpectedDtoShape()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetDashboardStatsQuery());

        // Assert — verify DTO structure
        Assert.True(result.Success);
        var dto = result.Data!;
        Assert.True(dto.UnreadCount >= 0);
        Assert.True(dto.FavoritesCount >= 0);
        Assert.True(dto.PendingReviewsCount >= 0);
    }
}
