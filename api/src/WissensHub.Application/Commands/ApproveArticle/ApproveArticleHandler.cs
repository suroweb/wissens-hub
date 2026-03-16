namespace WissensHub.Application.Commands.ApproveArticle;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class ApproveArticleHandler(ICurrentUser currentUser)
    : IRequestHandler<ApproveArticleCommand, ApiResponse<ApprovalHistoryDto>>
{
    public Task<ApiResponse<ApprovalHistoryDto>> Handle(
        ApproveArticleCommand request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo operations + db.SaveChangesAsync(ct)
        var dto = new ApprovalHistoryDto(
            Id: 1,
            PageId: request.PageId,
            Action: request.Action,
            ActionBy: currentUser.UserId,
            ActionByDisplayName: currentUser.DisplayName,
            ActionDate: DateTime.UtcNow,
            Comment: request.Comment);

        return Task.FromResult(ApiResponse<ApprovalHistoryDto>.Ok(dto));
    }
}
