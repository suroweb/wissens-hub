namespace WissensHub.Application.Commands.FlagArticle;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class FlagArticleHandler(ICurrentUser currentUser)
    : IRequestHandler<FlagArticleCommand, ApiResponse<ArticleFlagDto>>
{
    public Task<ApiResponse<ArticleFlagDto>> Handle(
        FlagArticleCommand request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo operations + db.SaveChangesAsync(ct)
        var dto = new ArticleFlagDto(
            Id: 1,
            PageId: request.PageId,
            UserId: currentUser.UserId,
            UserDisplayName: currentUser.DisplayName,
            Reason: request.Reason,
            FlaggedDate: DateTime.UtcNow,
            IsResolved: false);

        return Task.FromResult(ApiResponse<ArticleFlagDto>.Ok(dto));
    }
}
