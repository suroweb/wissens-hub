namespace WissensHub.Application.Queries.GetReadStats;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Reviewers")]
public record GetReadStatsQuery(int PageId) : IRequest<ApiResponse<ReadStatsDto>>;
