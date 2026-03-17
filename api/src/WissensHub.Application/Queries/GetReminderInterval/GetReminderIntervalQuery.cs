namespace WissensHub.Application.Queries.GetReminderInterval;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Owners")]
public record GetReminderIntervalQuery() : IRequest<ApiResponse<int>>;
