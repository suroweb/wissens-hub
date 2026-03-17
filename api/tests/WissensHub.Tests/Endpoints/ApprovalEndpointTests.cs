using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WissensHub.Application.Commands.ApproveArticle;
using WissensHub.Application.Common;
using WissensHub.Domain.Entities;
using WissensHub.Infrastructure.Data;
using WissensHub.Tests.Infrastructure;

namespace WissensHub.Tests.Endpoints;

public class ApprovalEndpointTests : IntegrationTestBase
{
    public ApprovalEndpointTests(IntegrationTestFixture fixture)
        : base(fixture)
    {
        CleanupAsync().GetAwaiter().GetResult();
    }

    // --- API-06: ApproveArticle ---

    [Fact]
    public async Task ApproveArticle_InReviewToPublished_Succeeds()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 100, title: "Test Article", status: "InReview");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new ApproveArticleCommand(100, "Approved", "Looks good"));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal(100, result.Data!.PageId);
        Assert.Equal("Approved", result.Data.Action);
        Assert.Equal("test-user-oid", result.Data.ActionBy);
        Assert.Equal("Test User", result.Data.ActionByDisplayName);
        Assert.Equal("Looks good", result.Data.Comment);

        // Verify DB state
        var article = await db.ArticleMetadata.FirstAsync(a => a.PageId == 100);
        Assert.Equal("Published", article.Status);

        var history = await db.ApprovalHistory.FirstAsync(h => h.PageId == 100);
        Assert.Equal("Approved", history.Action);
    }

    [Fact]
    public async Task ApproveArticle_InReviewToRejected_ChangesStatusToDraft()
    {
        // Arrange
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 101, title: "Rejected Article", status: "InReview");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act
        var result = await mediator.Send(new ApproveArticleCommand(101, "Rejected", "Needs more work"));

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Rejected", result.Data!.Action);

        // Verify status changed to Draft (Rejected maps to Draft in handler)
        var article = await db.ArticleMetadata.FirstAsync(a => a.PageId == 101);
        Assert.Equal("Draft", article.Status);
    }

    [Fact]
    public async Task ApproveArticle_DraftWithApprovedAction_ThrowsInvalidOperation()
    {
        // Arrange — Draft can only transition to InReview (via Submitted action)
        using var scope = CreateScope();
        var db = GetDbContext(scope);
        SeedArticle(db, pageId: 102, title: "Draft Article", status: "Draft");
        await db.SaveChangesAsync();

        var mediator = GetMediator(scope);

        // Act & Assert — Cannot approve a Draft article (Published is not an allowed transition from Draft)
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => mediator.Send(new ApproveArticleCommand(102, "Approved", "Try to approve draft")));
    }

    [Fact]
    public async Task ApproveArticle_NonExistentArticle_ThrowsKeyNotFound()
    {
        // Arrange
        using var scope = CreateScope();
        var mediator = GetMediator(scope);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => mediator.Send(new ApproveArticleCommand(99999, "Approved", "Does not exist")));
    }
}
