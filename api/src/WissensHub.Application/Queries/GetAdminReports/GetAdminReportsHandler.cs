namespace WissensHub.Application.Queries.GetAdminReports;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetAdminReportsHandler(ICurrentUser currentUser)
    : IRequestHandler<GetAdminReportsQuery, ApiResponse<AdminReportDto>>
{
    public Task<ApiResponse<AdminReportDto>> Handle(
        GetAdminReportsQuery request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo query
        var articles = new List<ArticleReportDto>
        {
            new(PageId: 1, Title: "IT-Sicherheitsrichtlinie 2024", Status: "Published", Category: "IT-Sicherheit", ReadCount: 42, TargetUserCount: 50, FlagCount: 0, LastUpdated: DateTime.UtcNow.AddDays(-5)),
            new(PageId: 2, Title: "Onboarding-Leitfaden", Status: "Published", Category: "Personalwesen", ReadCount: 28, TargetUserCount: 30, FlagCount: 1, LastUpdated: DateTime.UtcNow.AddDays(-15)),
            new(PageId: 6, Title: "Neue Arbeitszeitregelung", Status: "InReview", Category: "Personalwesen", ReadCount: 0, TargetUserCount: 50, FlagCount: 0, LastUpdated: DateTime.UtcNow.AddDays(-1))
        };

        var dto = new AdminReportDto(
            Articles: articles,
            TotalArticles: 10,
            PublishedCount: 7,
            DraftCount: 2,
            InReviewCount: 1);

        return Task.FromResult(ApiResponse<AdminReportDto>.Ok(dto));
    }
}
