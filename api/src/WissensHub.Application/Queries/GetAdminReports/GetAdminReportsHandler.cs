namespace WissensHub.Application.Queries.GetAdminReports;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetAdminReportsHandler(
    ICurrentUser currentUser,
    IArticleMetadataRepository articleMetadataRepo)
    : IRequestHandler<GetAdminReportsQuery, ApiResponse<AdminReportDto>>
{
    public async Task<ApiResponse<AdminReportDto>> Handle(
        GetAdminReportsQuery request, CancellationToken cancellationToken)
    {
        var articles = await articleMetadataRepo.GetAllForAdminReportAsync(cancellationToken);

        var articleDtos = articles.Select(a => new ArticleReportDto(
            PageId: a.PageId,
            Title: $"Article {a.PageId}",
            Status: a.Status,
            Category: a.Category?.Name ?? "Uncategorized",
            ReadCount: a.ReadConfirmations.Count,
            TargetUserCount: a.ArticleTargetGroups.Count,
            FlagCount: a.ArticleFlags.Count,
            LastUpdated: a.UpdatedAt
        )).ToList();

        var dto = new AdminReportDto(
            Articles: articleDtos,
            TotalArticles: articles.Count,
            PublishedCount: articles.Count(a => a.Status == "Published"),
            DraftCount: articles.Count(a => a.Status == "Draft"),
            InReviewCount: articles.Count(a => a.Status == "InReview"),
            FlaggedCount: articles.Count(a => a.ArticleFlags.Count > 0));

        return ApiResponse<AdminReportDto>.Ok(dto);
    }
}
