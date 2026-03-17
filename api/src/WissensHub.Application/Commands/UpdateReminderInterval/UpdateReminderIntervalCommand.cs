namespace WissensHub.Application.Commands.UpdateReminderInterval;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record UpdateReminderIntervalCommand(int Days) : IRequest<ApiResponse<int>>;
