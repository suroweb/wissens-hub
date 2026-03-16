namespace WissensHub.Application.Commands.FlagArticle;

using MediatR;
using WissensHub.Application.Common;

public record FlagArticleCommand(int PageId, string Reason) : IRequest<ApiResponse<ArticleFlagDto>>;

public record ArticleFlagDto(
    int Id,
    int PageId,
    string UserId,
    string UserDisplayName,
    string Reason,
    DateTime FlaggedDate,
    bool IsResolved);
