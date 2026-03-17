namespace WissensHub.Application.Commands.DeleteTargetGroup;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record DeleteTargetGroupCommand(int Id) : IRequest<ApiResponse<bool>>;
