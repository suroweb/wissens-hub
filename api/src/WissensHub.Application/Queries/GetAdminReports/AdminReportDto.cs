namespace WissensHub.Application.Queries.GetAdminReports;

public record AdminReportDto(
    List<ArticleReportDto> Articles,
    int TotalArticles,
    int PublishedCount,
    int DraftCount,
    int InReviewCount);

public record ArticleReportDto(
    int PageId,
    string Title,
    string Status,
    string Category,
    int ReadCount,
    int TargetUserCount,
    int FlagCount,
    DateTime LastUpdated);
