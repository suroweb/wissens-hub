namespace WissensHub.Application.Commands.MarkAsRead;

using FluentValidation;

public class MarkAsReadValidator : AbstractValidator<MarkAsReadCommand>
{
    public MarkAsReadValidator()
    {
        RuleFor(x => x.PageId)
            .GreaterThan(0)
            .WithMessage("PageId must be greater than 0");
    }
}
