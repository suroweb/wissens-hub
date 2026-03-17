namespace WissensHub.Application.Queries.GetReminderInterval;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetReminderIntervalHandler(
    ICurrentUser currentUser,
    ISystemConfigurationRepository configRepo)
    : IRequestHandler<GetReminderIntervalQuery, ApiResponse<int>>
{
    private const string ReminderIntervalKey = "ReminderIntervalDays";
    private const int DefaultInterval = 7;

    public async Task<ApiResponse<int>> Handle(
        GetReminderIntervalQuery request, CancellationToken cancellationToken)
    {
        var config = await configRepo.GetByKeyAsync(ReminderIntervalKey, cancellationToken);

        var days = config is not null && int.TryParse(config.Value, out var parsed)
            ? parsed
            : DefaultInterval;

        return ApiResponse<int>.Ok(days);
    }
}
