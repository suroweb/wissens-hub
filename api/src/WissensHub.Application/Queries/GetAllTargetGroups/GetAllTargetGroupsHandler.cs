namespace WissensHub.Application.Queries.GetAllTargetGroups;

using MediatR;
using WissensHub.Application.Commands.CreateTargetGroup;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetAllTargetGroupsHandler(
    ICurrentUser currentUser,
    ITargetGroupRepository targetGroupRepo)
    : IRequestHandler<GetAllTargetGroupsQuery, ApiResponse<List<TargetGroupDto>>>
{
    public async Task<ApiResponse<List<TargetGroupDto>>> Handle(
        GetAllTargetGroupsQuery request, CancellationToken cancellationToken)
    {
        var groups = await targetGroupRepo.GetAllAsync(cancellationToken);

        var dtos = groups
            .Select(g => new TargetGroupDto(g.Id, g.Name, g.SharePointGroupName, g.IsActive))
            .ToList();

        return ApiResponse<List<TargetGroupDto>>.Ok(dtos);
    }
}
