namespace WissensHub.Domain.Entities;

public class ReadConfirmation
{
    public int Id { get; set; }
    public int ArticleMetadataId { get; set; }
    public int PageId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public DateTime ReadDate { get; set; }
    public int ContentVersion { get; set; }

    // Navigation properties
    public ArticleMetadata? ArticleMetadata { get; set; }
}
