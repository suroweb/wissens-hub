using Microsoft.EntityFrameworkCore;
using WissensHub.Infrastructure.Data;

namespace WissensHub.Tests.Infrastructure;

public class DatabaseSchemaTests
{
    private WissensHubDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<WissensHubDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new WissensHubDbContext(options);
    }

    [Fact]
    public void DbContext_HasAllExpectedDbSets()
    {
        using var context = CreateContext();
        Assert.NotNull(context.ArticleMetadata);
        Assert.NotNull(context.ReadConfirmations);
        Assert.NotNull(context.ArticleFlags);
        Assert.NotNull(context.Favorites);
        Assert.NotNull(context.ApprovalHistory);
        Assert.NotNull(context.Categories);
        Assert.NotNull(context.TargetGroups);
        Assert.NotNull(context.ArticleTargetGroups);
    }

    [Theory]
    [InlineData("ArticleMetadata")]
    [InlineData("ReadConfirmation")]
    [InlineData("ArticleFlag")]
    [InlineData("Favorite")]
    [InlineData("ApprovalHistory")]
    [InlineData("Category")]
    [InlineData("TargetGroup")]
    [InlineData("ArticleTargetGroup")]
    public void DbContext_HasEntityType(string entityName)
    {
        using var context = CreateContext();
        var entityType = context.Model.FindEntityType($"WissensHub.Domain.Entities.{entityName}");
        Assert.NotNull(entityType);
    }

    [Fact]
    public void ArticleMetadata_HasUniquePageIdIndex()
    {
        using var context = CreateContext();
        var entityType = context.Model.FindEntityType(typeof(WissensHub.Domain.Entities.ArticleMetadata))!;
        var pageIdProperty = entityType.FindProperty("PageId")!;
        var index = entityType.GetIndexes().FirstOrDefault(i => i.Properties.Contains(pageIdProperty));
        Assert.NotNull(index);
        Assert.True(index.IsUnique);
    }

    [Fact]
    public void ArticleTargetGroup_HasCompositePrimaryKey()
    {
        using var context = CreateContext();
        var entityType = context.Model.FindEntityType(typeof(WissensHub.Domain.Entities.ArticleTargetGroup))!;
        var pk = entityType.FindPrimaryKey()!;
        Assert.Equal(2, pk.Properties.Count);
    }

    [Fact]
    public void Favorite_HasUniqueCompositeIndex()
    {
        using var context = CreateContext();
        var entityType = context.Model.FindEntityType(typeof(WissensHub.Domain.Entities.Favorite))!;
        var index = entityType.GetIndexes()
            .FirstOrDefault(i => i.Properties.Count == 2
                && i.Properties.Any(p => p.Name == "ArticleMetadataId")
                && i.Properties.Any(p => p.Name == "UserId"));
        Assert.NotNull(index);
        Assert.True(index.IsUnique);
    }

    [Fact]
    public void Category_HasUniqueNameIndex()
    {
        using var context = CreateContext();
        var entityType = context.Model.FindEntityType(typeof(WissensHub.Domain.Entities.Category))!;
        var nameProperty = entityType.FindProperty("Name")!;
        var index = entityType.GetIndexes().FirstOrDefault(i => i.Properties.Contains(nameProperty));
        Assert.NotNull(index);
        Assert.True(index.IsUnique);
    }
}
