namespace WissensHub.Application.Queries.GetApprovalHistory;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetApprovalHistoryHandler(IApprovalRepository approvalRepo)
    : IRequestHandler<GetApprovalHistoryQuery, ApiResponse<List<ApprovalHistoryEntryDto>>>
{
    public async Task<ApiResponse<List<ApprovalHistoryEntryDto>>> Handle(
        GetApprovalHistoryQuery request, CancellationToken ct)
    {
        var history = await approvalRepo.GetByPageIdAsync(request.PageId, ct);
        var dtos = history.Select(h => new ApprovalHistoryEntryDto(
            h.Id, h.PageId, h.Action, h.ActionBy, h.ActionByDisplayName,
            h.ActionDate, h.Comment)).ToList();
        return ApiResponse<List<ApprovalHistoryEntryDto>>.Ok(dtos);
    }
}
