namespace WissensHub.Application.Commands.UpdateTargetGroup;

using MediatR;
using WissensHub.Application.Commands.CreateTargetGroup;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record UpdateTargetGroupCommand(int Id, string Name, bool IsActive)
    : IRequest<ApiResponse<TargetGroupDto>>;
