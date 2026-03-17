namespace WissensHub.Application.Queries.GetDetailedReadStats;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record GetDetailedReadStatsQuery(int PageId) : IRequest<ApiResponse<DetailedReadStatsDto>>;
