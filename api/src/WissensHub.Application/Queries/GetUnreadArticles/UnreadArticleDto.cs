namespace WissensHub.Application.Queries.GetUnreadArticles;

public record UnreadArticleDto(
    int PageId,
    string Title,
    string Category,
    bool IsMandatory,
    DateTime UpdatedAt);
