namespace WissensHub.Application.Queries.GetDashboardStats;

using MediatR;
using WissensHub.Application.Common;

public record GetDashboardStatsQuery() : IRequest<ApiResponse<DashboardStatsDto>>;
