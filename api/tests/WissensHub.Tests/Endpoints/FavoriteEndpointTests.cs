using MediatR;
using Microsoft.Extensions.DependencyInjection;
using WissensHub.Application.Commands.ToggleFavorite;
using WissensHub.Application.Common;
using WissensHub.Application.Queries.GetFavorites;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;
using WissensHub.Tests.Infrastructure;

namespace WissensHub.Tests.Endpoints;

public class FavoriteEndpointTests : IntegrationTestBase
{
    public FavoriteEndpointTests(IntegrationTestFixture fixture)
        : base(fixture)
    {
        CleanupAsync().GetAwaiter().GetResult();
    }

    // --- API-07: GetFavorites ---

    [Fact]
    public async Task GetFavorites_ReturnsSuccessResponse()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act — handler returns mock favorites list
        var result = await mediator.Send(new GetFavoritesQuery());

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
    }

    [Fact]
    public async Task GetFavorites_MockReturnsHardcodedList()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetFavoritesQuery());

        // Assert — mock handler returns 2 favorites
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(2, result.Data!.Count);
    }

    // --- API-08: ToggleFavorite ---

    [Fact]
    public async Task ToggleFavorite_AddsToFavorites_ReturnsSuccess()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Test Article", status: "Published");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new ToggleFavoriteCommand(100));

        // Assert — mock handler always returns IsFavorited = true
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data!.PageId);
        Assert.True(result.Data.IsFavorited);
    }

    [Fact]
    public async Task ToggleFavorite_PipelineExecutesForToggle()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act — toggle twice through the MediatR pipeline
        var result1 = await mediator.Send(new ToggleFavoriteCommand(100));
        var result2 = await mediator.Send(new ToggleFavoriteCommand(100));

        // Assert — both pipeline executions succeed
        Assert.True(result1.Success);
        Assert.True(result2.Success);
    }

    [Fact]
    public async Task ToggleFavorite_ForNonExistentArticle_PipelineExecutes()
    {
        // Arrange — mock handler does not check article existence
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new ToggleFavoriteCommand(99999));

        // Assert
        Assert.True(result.Success);
    }
}
