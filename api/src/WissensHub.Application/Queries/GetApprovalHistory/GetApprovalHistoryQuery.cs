namespace WissensHub.Application.Queries.GetApprovalHistory;

using MediatR;
using WissensHub.Application.Common;

public record GetApprovalHistoryQuery(int PageId) : IRequest<ApiResponse<List<ApprovalHistoryEntryDto>>>;

public record ApprovalHistoryEntryDto(
    int Id,
    int PageId,
    string Action,
    string ActionBy,
    string ActionByDisplayName,
    DateTime ActionDate,
    string? Comment);
