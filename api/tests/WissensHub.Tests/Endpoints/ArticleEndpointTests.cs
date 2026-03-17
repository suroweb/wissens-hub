using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WissensHub.Application.Commands.FlagArticle;
using WissensHub.Application.Commands.MarkAsRead;
using WissensHub.Application.Common;
using WissensHub.Application.Queries.GetArticleStatus;
using WissensHub.Application.Queries.GetReadStats;
using WissensHub.Application.Queries.GetUnreadArticles;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;
using WissensHub.Tests.Infrastructure;

namespace WissensHub.Tests.Endpoints;

public class ArticleEndpointTests : IntegrationTestBase
{
    public ArticleEndpointTests(IntegrationTestFixture fixture)
        : base(fixture)
    {
        CleanupAsync().GetAwaiter().GetResult();
    }

    // --- API-01: GetArticleStatus ---

    [Fact]
    public async Task GetArticleStatus_WithExistingArticle_ReturnsSuccess()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Test Article", status: "Published");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetArticleStatusQuery(100));

        // Assert — handler currently returns mock data but pipeline runs successfully
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data!.PageId);
    }

    [Fact]
    public async Task GetArticleStatus_WithNonExistentPageId_ReturnsResponse()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act — handler returns mock data for any PageId; verifies pipeline runs without error
        var result = await mediator.Send(new GetArticleStatusQuery(99999));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
    }

    // --- API-02: GetUnreadArticles ---

    [Fact]
    public async Task GetUnreadArticles_ReturnsSuccessWithArticles()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 200, title: "Article A", status: "Published");
        SeedArticle(db, pageId: 201, title: "Article B", status: "Published");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetUnreadArticlesQuery());

        // Assert — handler returns hardcoded mock list; pipeline executes successfully
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.True(result.Data!.Count > 0);
    }

    [Fact]
    public async Task GetUnreadArticles_PipelineExecutesWithoutError()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetUnreadArticlesQuery());

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
    }

    // --- API-03: MarkAsRead ---

    [Fact]
    public async Task MarkAsRead_WithValidPageId_ReturnsSuccess()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Test Article", status: "Published");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new MarkAsReadCommand(100));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data!.PageId);
        Assert.Equal("test-user-oid", result.Data.UserId);
        Assert.Equal("Test User", result.Data.UserDisplayName);
    }

    [Fact]
    public async Task MarkAsRead_WithNonExistentPageId_PipelineExecutes()
    {
        // Arrange — handler is a mock that succeeds regardless; validates pipeline flow
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new MarkAsReadCommand(99999));

        // Assert
        Assert.True(result.Success);
    }

    // --- API-04: FlagArticle ---

    [Fact]
    public async Task FlagArticle_WithValidReason_ReturnsSuccess()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Test Article", status: "Published");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new FlagArticleCommand(100, "Outdated content"));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data!.PageId);
        Assert.Equal("Outdated content", result.Data.Reason);
        Assert.False(result.Data.IsResolved);
    }

    [Fact]
    public async Task FlagArticle_WithEmptyReason_ThrowsValidationException()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act & Assert — FluentValidation rejects empty reason
        await Assert.ThrowsAsync<ValidationException>(
            () => mediator.Send(new FlagArticleCommand(100, "")));
    }

    // --- API-05: GetReadStats ---

    [Fact]
    public async Task GetReadStats_WithExistingArticle_ReturnsStats()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Test Article", status: "Published");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act — requires WissensHub Reviewers group (test user has it)
        var result = await mediator.Send(new GetReadStatsQuery(100));

        // Assert — handler returns mock stats
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data!.PageId);
    }

    [Fact]
    public async Task GetReadStats_ReturnsUsersList()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetReadStatsQuery(100));

        // Assert — mock handler returns 3 hardcoded users
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.NotNull(result.Data!.Users);
        Assert.True(result.Data.Users.Count > 0);
    }
}
