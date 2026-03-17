namespace WissensHub.Application.Queries.GetDetailedReadStats;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;
using WissensHub.Application.Queries.GetReadStats;

public class GetDetailedReadStatsHandler(
    ICurrentUser currentUser,
    IReadConfirmationRepository readConfirmationRepo,
    IArticleMetadataRepository articleMetadataRepo)
    : IRequestHandler<GetDetailedReadStatsQuery, ApiResponse<DetailedReadStatsDto>>
{
    public async Task<ApiResponse<DetailedReadStatsDto>> Handle(
        GetDetailedReadStatsQuery request, CancellationToken cancellationToken)
    {
        var metadata = await articleMetadataRepo.GetByPageIdWithTargetGroupsAsync(request.PageId, cancellationToken)
            ?? throw new KeyNotFoundException($"Article with PageId {request.PageId} not found");

        var readConfirmations = await readConfirmationRepo.GetByPageIdAsync(request.PageId, cancellationToken);

        var users = readConfirmations
            .Select(rc => new UserReadStatusDto(
                rc.UserId,
                rc.UserDisplayName,
                true,
                rc.ReadDate))
            .ToList();

        // Count target users from associated target groups
        var targetGroupCount = metadata.ArticleTargetGroups.Count;
        var readCount = users.Count;

        return ApiResponse<DetailedReadStatsDto>.Ok(new DetailedReadStatsDto(
            PageId: request.PageId,
            Title: $"Article {request.PageId}",
            TotalTargetUsers: targetGroupCount,
            ReadCount: readCount,
            UnreadCount: Math.Max(0, targetGroupCount - readCount),
            Users: users));
    }
}
