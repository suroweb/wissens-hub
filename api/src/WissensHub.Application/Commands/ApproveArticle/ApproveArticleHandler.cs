namespace WissensHub.Application.Commands.ApproveArticle;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;
using WissensHub.Domain.Entities;

public class ApproveArticleHandler(
    ICurrentUser currentUser,
    IApprovalRepository approvalRepo,
    IArticleMetadataRepository metadataRepo,
    IUnitOfWork unitOfWork)
    : IRequestHandler<ApproveArticleCommand, ApiResponse<ApprovalHistoryDto>>
{
    private static readonly Dictionary<string, string> ActionToStatus = new()
    {
        ["Approved"] = "Published",
        ["Rejected"] = "Draft",
        ["Submitted"] = "InReview",
        ["Archived"] = "Archived",
        ["Restored"] = "Published",
    };

    private static readonly Dictionary<string, List<string>> AllowedTransitions = new()
    {
        ["Draft"] = ["InReview"],
        ["InReview"] = ["Published", "Draft"],
        ["Published"] = ["Archived"],
        ["Archived"] = ["Published"],
    };

    public async Task<ApiResponse<ApprovalHistoryDto>> Handle(
        ApproveArticleCommand request, CancellationToken cancellationToken)
    {
        var metadata = await metadataRepo.GetByPageIdAsync(request.PageId, cancellationToken)
            ?? throw new KeyNotFoundException($"Article with PageId {request.PageId} not found");

        var newStatus = ActionToStatus.GetValueOrDefault(request.Action)
            ?? throw new InvalidOperationException($"Unknown action: {request.Action}");

        if (!AllowedTransitions.TryGetValue(metadata.Status, out var allowed) ||
            !allowed.Contains(newStatus))
        {
            throw new InvalidOperationException(
                $"Cannot transition from {metadata.Status} to {newStatus}");
        }

        var fromStatus = metadata.Status;
        metadata.Status = newStatus;
        metadata.UpdatedAt = DateTime.UtcNow;
        metadataRepo.Update(metadata);

        var history = new ApprovalHistory
        {
            ArticleMetadataId = metadata.Id,
            PageId = request.PageId,
            Action = request.Action,
            ActionBy = currentUser.UserId,
            ActionByDisplayName = currentUser.DisplayName,
            ActionDate = DateTime.UtcNow,
            Comment = request.Comment,
        };

        await approvalRepo.AddAsync(history, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<ApprovalHistoryDto>.Ok(new ApprovalHistoryDto(
            history.Id,
            history.PageId,
            history.Action,
            history.ActionBy,
            history.ActionByDisplayName,
            history.ActionDate,
            history.Comment));
    }
}
