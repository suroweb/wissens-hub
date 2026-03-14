namespace WissensHub.Domain.Entities;

public class ArticleMetadata
{
    public int Id { get; set; }
    public int PageId { get; set; }
    public string Status { get; set; } = "Draft";
    public int? CategoryId { get; set; }
    public bool IsMandatory { get; set; }
    public string? ReviewById { get; set; }
    public DateTime? ReviewByDate { get; set; }
    public int ContentVersion { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Category? Category { get; set; }
    public ICollection<ArticleTargetGroup> ArticleTargetGroups { get; set; } = [];
    public ICollection<ReadConfirmation> ReadConfirmations { get; set; } = [];
    public ICollection<ArticleFlag> ArticleFlags { get; set; } = [];
    public ICollection<Favorite> Favorites { get; set; } = [];
    public ICollection<ApprovalHistory> ApprovalHistories { get; set; } = [];
}
