namespace WissensHub.Application.Commands.ApproveArticle;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Common.Attributes;

[RequireGroup("WissensHub Reviewers")]
public record ApproveArticleCommand(int PageId, string Action, string? Comment)
    : IRequest<ApiResponse<ApprovalHistoryDto>>;

public record ApprovalHistoryDto(
    int Id,
    int PageId,
    string Action,
    string ActionBy,
    string ActionByDisplayName,
    DateTime ActionDate,
    string? Comment);
