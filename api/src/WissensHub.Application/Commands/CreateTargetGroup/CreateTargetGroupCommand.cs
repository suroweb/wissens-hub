namespace WissensHub.Application.Commands.CreateTargetGroup;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record CreateTargetGroupCommand(string Name, string SharePointGroupName)
    : IRequest<ApiResponse<TargetGroupDto>>;

public record TargetGroupDto(int Id, string Name, string SharePointGroupName, bool IsActive);
