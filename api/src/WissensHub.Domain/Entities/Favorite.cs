namespace WissensHub.Domain.Entities;

public class Favorite
{
    public int Id { get; set; }
    public int ArticleMetadataId { get; set; }
    public int PageId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ArticleMetadata? ArticleMetadata { get; set; }
}
