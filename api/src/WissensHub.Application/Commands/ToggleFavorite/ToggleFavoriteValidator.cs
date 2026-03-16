namespace WissensHub.Application.Commands.ToggleFavorite;

using FluentValidation;

public class ToggleFavoriteValidator : AbstractValidator<ToggleFavoriteCommand>
{
    public ToggleFavoriteValidator()
    {
        RuleFor(x => x.PageId)
            .GreaterThan(0)
            .WithMessage("PageId must be greater than 0");
    }
}
