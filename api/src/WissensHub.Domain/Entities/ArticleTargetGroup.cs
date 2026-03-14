namespace WissensHub.Domain.Entities;

public class ArticleTargetGroup
{
    public int ArticleMetadataId { get; set; }
    public int TargetGroupId { get; set; }

    // Navigation properties
    public ArticleMetadata? ArticleMetadata { get; set; }
    public TargetGroup? TargetGroup { get; set; }
}
