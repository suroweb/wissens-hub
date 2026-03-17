namespace WissensHub.Application.Queries.GetAllTargetGroups;

using MediatR;
using WissensHub.Application.Commands.CreateTargetGroup;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record GetAllTargetGroupsQuery() : IRequest<ApiResponse<List<TargetGroupDto>>>;
