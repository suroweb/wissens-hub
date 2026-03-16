namespace WissensHub.Application.Queries.GetDashboardStats;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetDashboardStatsHandler(ICurrentUser currentUser)
    : IRequestHandler<GetDashboardStatsQuery, ApiResponse<DashboardStatsDto>>
{
    public Task<ApiResponse<DashboardStatsDto>> Handle(
        GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo query filtered by currentUser
        var dto = new DashboardStatsDto(
            UnreadCount: 3,
            FavoritesCount: 2,
            PendingReviewsCount: 1);

        return Task.FromResult(ApiResponse<DashboardStatsDto>.Ok(dto));
    }
}
