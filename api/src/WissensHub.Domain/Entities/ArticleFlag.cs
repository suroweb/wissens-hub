namespace WissensHub.Domain.Entities;

public class ArticleFlag
{
    public int Id { get; set; }
    public int ArticleMetadataId { get; set; }
    public int PageId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTime FlaggedDate { get; set; }
    public bool IsResolved { get; set; }

    // Navigation properties
    public ArticleMetadata? ArticleMetadata { get; set; }
}
