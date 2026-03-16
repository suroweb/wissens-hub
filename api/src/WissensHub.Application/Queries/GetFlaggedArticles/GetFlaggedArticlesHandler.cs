namespace WissensHub.Application.Queries.GetFlaggedArticles;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetFlaggedArticlesHandler(IFlagRepository flagRepo)
    : IRequestHandler<GetFlaggedArticlesQuery, ApiResponse<List<FlaggedArticleDto>>>
{
    public async Task<ApiResponse<List<FlaggedArticleDto>>> Handle(
        GetFlaggedArticlesQuery request, CancellationToken ct)
    {
        var flags = await flagRepo.GetUnresolvedAsync(ct);
        var dtos = flags.Select(f => new FlaggedArticleDto(
            f.Id, f.PageId, f.UserId, f.UserDisplayName, f.Reason, f.FlaggedDate)).ToList();
        return ApiResponse<List<FlaggedArticleDto>>.Ok(dtos);
    }
}
