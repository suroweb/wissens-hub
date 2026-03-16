namespace WissensHub.Application.Queries.GetReadStats;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetReadStatsHandler(ICurrentUser currentUser)
    : IRequestHandler<GetReadStatsQuery, ApiResponse<ReadStatsDto>>
{
    public Task<ApiResponse<ReadStatsDto>> Handle(
        GetReadStatsQuery request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo query
        var users = new List<UserReadStatusDto>
        {
            new("user-1", "Max Mustermann", true, DateTime.UtcNow.AddDays(-3)),
            new("user-2", "Erika Musterfrau", true, DateTime.UtcNow.AddDays(-1)),
            new("user-3", "Hans Schmidt", false, null)
        };

        var dto = new ReadStatsDto(
            PageId: request.PageId,
            TotalTargetUsers: 3,
            ReadCount: 2,
            UnreadCount: 1,
            Users: users);

        return Task.FromResult(ApiResponse<ReadStatsDto>.Ok(dto));
    }
}
