namespace WissensHub.Application.Queries.GetFlaggedArticles;

public record FlaggedArticleDto(
    int Id,
    int PageId,
    string UserId,
    string UserDisplayName,
    string Reason,
    DateTime FlaggedDate);
