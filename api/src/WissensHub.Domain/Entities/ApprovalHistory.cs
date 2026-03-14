namespace WissensHub.Domain.Entities;

public class ApprovalHistory
{
    public int Id { get; set; }
    public int ArticleMetadataId { get; set; }
    public int PageId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ActionBy { get; set; } = string.Empty;
    public string ActionByDisplayName { get; set; } = string.Empty;
    public DateTime ActionDate { get; set; }
    public string? Comment { get; set; }

    // Navigation properties
    public ArticleMetadata? ArticleMetadata { get; set; }
}
