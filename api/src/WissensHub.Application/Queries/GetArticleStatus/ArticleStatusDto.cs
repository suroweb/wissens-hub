namespace WissensHub.Application.Queries.GetArticleStatus;

public record ArticleStatusDto(
    int PageId,
    string Status,
    string? Category,
    bool IsMandatory,
    DateTime UpdatedAt,
    int ContentVersion,
    bool HasRead,
    DateTime? ReadDate,
    List<string> TargetGroups);
