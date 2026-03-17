namespace WissensHub.Application.Commands.UpdateReminderInterval;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;

public class UpdateReminderIntervalHandler(
    ICurrentUser currentUser,
    ISystemConfigurationRepository configRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateReminderIntervalCommand, ApiResponse<int>>
{
    private const string ReminderIntervalKey = "ReminderIntervalDays";

    public async Task<ApiResponse<int>> Handle(
        UpdateReminderIntervalCommand request, CancellationToken cancellationToken)
    {
        var config = await configRepo.GetByKeyAsync(ReminderIntervalKey, cancellationToken);

        if (config is not null)
        {
            config.Value = request.Days.ToString();
            config.UpdatedAt = DateTime.UtcNow;
            configRepo.Update(config);
        }
        else
        {
            var entity = new SystemConfiguration
            {
                Key = ReminderIntervalKey,
                Value = request.Days.ToString(),
                UpdatedAt = DateTime.UtcNow,
            };
            await configRepo.AddAsync(entity, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<int>.Ok(request.Days);
    }
}
