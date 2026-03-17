namespace WissensHub.Application.Commands.CreateTargetGroup;

using FluentValidation;

public class CreateTargetGroupValidator : AbstractValidator<CreateTargetGroupCommand>
{
    public CreateTargetGroupValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(100)
            .WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.SharePointGroupName)
            .NotEmpty()
            .WithMessage("SharePointGroupName is required");
    }
}
