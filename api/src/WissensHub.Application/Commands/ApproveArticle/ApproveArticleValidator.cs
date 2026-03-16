namespace WissensHub.Application.Commands.ApproveArticle;

using FluentValidation;

public class ApproveArticleValidator : AbstractValidator<ApproveArticleCommand>
{
    public ApproveArticleValidator()
    {
        RuleFor(x => x.PageId)
            .GreaterThan(0)
            .WithMessage("PageId must be greater than 0");

        RuleFor(x => x.Action)
            .NotEmpty()
            .WithMessage("Action is required")
            .Must(a => a is "Approved" or "Rejected" or "Submitted" or "Archived" or "Restored")
            .WithMessage("Action must be 'Approved', 'Rejected', 'Submitted', 'Archived', or 'Restored'");

        RuleFor(x => x.Comment)
            .NotEmpty()
            .When(x => x.Action == "Rejected")
            .WithMessage("Comment is required when rejecting");
    }
}
