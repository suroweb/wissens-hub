namespace WissensHub.Application.Commands.FlagArticle;

using FluentValidation;

public class FlagArticleValidator : AbstractValidator<FlagArticleCommand>
{
    public FlagArticleValidator()
    {
        RuleFor(x => x.PageId)
            .GreaterThan(0)
            .WithMessage("PageId must be greater than 0");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .WithMessage("Reason is required")
            .MaximumLength(500)
            .WithMessage("Reason must not exceed 500 characters");
    }
}
