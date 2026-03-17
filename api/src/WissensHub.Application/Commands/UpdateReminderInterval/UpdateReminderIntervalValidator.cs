namespace WissensHub.Application.Commands.UpdateReminderInterval;

using FluentValidation;

public class UpdateReminderIntervalValidator : AbstractValidator<UpdateReminderIntervalCommand>
{
    public UpdateReminderIntervalValidator()
    {
        RuleFor(x => x.Days)
            .GreaterThan(0)
            .WithMessage("Days must be greater than 0")
            .LessThanOrEqualTo(365)
            .WithMessage("Days must not exceed 365");
    }
}
