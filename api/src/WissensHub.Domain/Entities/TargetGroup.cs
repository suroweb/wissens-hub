namespace WissensHub.Domain.Entities;

public class TargetGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SharePointGroupName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<ArticleTargetGroup> ArticleTargetGroups { get; set; } = [];
}
