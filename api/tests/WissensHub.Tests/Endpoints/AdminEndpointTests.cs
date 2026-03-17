using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WissensHub.Application.Commands.CreateCategory;
using WissensHub.Application.Commands.CreateTargetGroup;
using WissensHub.Application.Commands.DeleteCategory;
using WissensHub.Application.Commands.UpdateCategory;
using WissensHub.Application.Commands.UpdateReminderInterval;
using WissensHub.Application.Common;
using WissensHub.Application.Queries.GetAdminReports;
using WissensHub.Application.Queries.GetAllCategories;
using WissensHub.Application.Queries.GetAllTargetGroups;
using WissensHub.Application.Queries.GetReminderInterval;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;
using WissensHub.Tests.Infrastructure;

namespace WissensHub.Tests.Endpoints;

public class AdminEndpointTests : IntegrationTestBase
{
    public AdminEndpointTests(IntegrationTestFixture fixture)
        : base(fixture)
    {
        CleanupAsync().GetAwaiter().GetResult();
    }

    // --- API-10: GetAdminReports ---

    [Fact]
    public async Task GetAdminReports_WithArticles_ReturnsReport()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Published Article", status: "Published");
        SeedArticle(db, pageId: 101, title: "Draft Article", status: "Draft");
        SeedArticle(db, pageId: 102, title: "InReview Article", status: "InReview");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act — requires WissensHub Owners group (test user has it)
        var result = await mediator.Send(new GetAdminReportsQuery());

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(3, result.Data!.TotalArticles);
        Assert.Equal(1, result.Data.PublishedCount);
        Assert.Equal(1, result.Data.DraftCount);
        Assert.Equal(1, result.Data.InReviewCount);
        Assert.Equal(3, result.Data.Articles.Count);
    }

    [Fact]
    public async Task GetAdminReports_EmptyDatabase_ReturnsEmptyReport()
    {
        // Arrange — clean database, no articles
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetAdminReportsQuery());

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(0, result.Data!.TotalArticles);
        Assert.Empty(result.Data.Articles);
    }

    // --- Categories CRUD ---

    [Fact]
    public async Task CreateCategory_WithValidData_CreatesInDb()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new CreateCategoryCommand("Test Category", "Test description"));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Test Category", result.Data!.Name);
        Assert.Equal("Test description", result.Data.Description);
        Assert.True(result.Data.IsActive);
        Assert.True(result.Data.Id > 0);

        // Verify in DB
        var db = GetDbContext(scope);
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Name == "Test Category");
        Assert.NotNull(category);
    }

    [Fact]
    public async Task GetAllCategories_AfterCreate_ContainsCategory()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);
        await mediator.Send(new CreateCategoryCommand("Cat A", "Description A"));

        // Act
        var result = await mediator.Send(new GetAllCategoriesQuery());

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Contains(result.Data!, c => c.Name == "Cat A");
    }

    [Fact]
    public async Task UpdateCategory_ChangesNameInDb()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);
        var created = await mediator.Send(new CreateCategoryCommand("Original Name", "Desc"));

        // Act
        var result = await mediator.Send(
            new UpdateCategoryCommand(created.Data!.Id, "Updated Name", "Updated Desc", true));

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Updated Name", result.Data!.Name);

        // Verify in DB
        var db = GetDbContext(scope);
        var category = await db.Categories.FindAsync(created.Data.Id);
        Assert.Equal("Updated Name", category!.Name);
    }

    [Fact]
    public async Task DeleteCategory_WithNoArticles_RemovesFromDb()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);
        var created = await mediator.Send(new CreateCategoryCommand("To Delete", null));

        // Act
        var result = await mediator.Send(new DeleteCategoryCommand(created.Data!.Id));

        // Assert
        Assert.True(result.Success);
        Assert.True(result.Data);

        // Verify removed from DB
        var db = GetDbContext(scope);
        var category = await db.Categories.FindAsync(created.Data.Id);
        Assert.Null(category);
    }

    [Fact]
    public async Task DeleteCategory_NonExistent_ThrowsKeyNotFound()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => mediator.Send(new DeleteCategoryCommand(99999)));
    }

    // --- Target Groups ---

    [Fact]
    public async Task CreateTargetGroup_CreatesInDb()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(
            new CreateTargetGroupCommand("Test Group", "Test SP Group"));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Test Group", result.Data!.Name);
        Assert.Equal("Test SP Group", result.Data.SharePointGroupName);
        Assert.True(result.Data.IsActive);

        // Verify in DB
        var db = GetDbContext(scope);
        var group = await db.TargetGroups.FirstOrDefaultAsync(g => g.Name == "Test Group");
        Assert.NotNull(group);
    }

    [Fact]
    public async Task GetAllTargetGroups_AfterCreate_ContainsGroup()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);
        await mediator.Send(new CreateTargetGroupCommand("Group A", "SP Group A"));

        // Act
        var result = await mediator.Send(new GetAllTargetGroupsQuery());

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Contains(result.Data!, g => g.Name == "Group A");
    }

    // --- Reminder Interval ---

    [Fact]
    public async Task GetReminderInterval_Default_Returns7Days()
    {
        // Arrange — no SystemConfiguration seeded, handler returns default 7
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new GetReminderIntervalQuery());

        // Assert
        Assert.True(result.Success);
        Assert.Equal(7, result.Data);
    }

    [Fact]
    public async Task UpdateReminderInterval_ThenGet_ReturnsUpdatedValue()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act
        var updateResult = await mediator.Send(new UpdateReminderIntervalCommand(14));
        var getResult = await mediator.Send(new GetReminderIntervalQuery());

        // Assert
        Assert.True(updateResult.Success);
        Assert.Equal(14, updateResult.Data);
        Assert.True(getResult.Success);
        Assert.Equal(14, getResult.Data);
    }
}
