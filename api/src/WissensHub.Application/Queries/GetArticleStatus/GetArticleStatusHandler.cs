namespace WissensHub.Application.Queries.GetArticleStatus;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetArticleStatusHandler(ICurrentUser currentUser)
    : IRequestHandler<GetArticleStatusQuery, ApiResponse<ArticleStatusDto>>
{
    public Task<ApiResponse<ArticleStatusDto>> Handle(
        GetArticleStatusQuery request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo query
        var dto = new ArticleStatusDto(
            PageId: request.PageId,
            Status: "Published",
            Category: "IT-Sicherheit",
            IsMandatory: true,
            UpdatedAt: DateTime.UtcNow.AddDays(-5),
            ContentVersion: 2,
            HasRead: false,
            ReadDate: null,
            TargetGroups: ["Alle Mitarbeiter"]);

        return Task.FromResult(ApiResponse<ArticleStatusDto>.Ok(dto));
    }
}
