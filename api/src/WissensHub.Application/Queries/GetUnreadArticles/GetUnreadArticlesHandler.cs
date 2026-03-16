namespace WissensHub.Application.Queries.GetUnreadArticles;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetUnreadArticlesHandler(ICurrentUser currentUser)
    : IRequestHandler<GetUnreadArticlesQuery, ApiResponse<List<UnreadArticleDto>>>
{
    public Task<ApiResponse<List<UnreadArticleDto>>> Handle(
        GetUnreadArticlesQuery request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo query filtered by currentUser
        var articles = new List<UnreadArticleDto>
        {
            new(PageId: 1, Title: "IT-Sicherheitsrichtlinie 2024", Category: "IT-Sicherheit", IsMandatory: true, UpdatedAt: DateTime.UtcNow.AddDays(-2)),
            new(PageId: 3, Title: "Datenschutz-Grundlagen", Category: "Datenschutz", IsMandatory: true, UpdatedAt: DateTime.UtcNow.AddDays(-7)),
            new(PageId: 5, Title: "Passwort-Richtlinie", Category: "IT-Sicherheit", IsMandatory: true, UpdatedAt: DateTime.UtcNow.AddDays(-14))
        };

        return Task.FromResult(ApiResponse<List<UnreadArticleDto>>.Ok(articles));
    }
}
