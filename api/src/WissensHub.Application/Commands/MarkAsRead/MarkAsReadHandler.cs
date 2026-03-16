namespace WissensHub.Application.Commands.MarkAsRead;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class MarkAsReadHandler(ICurrentUser currentUser)
    : IRequestHandler<MarkAsReadCommand, ApiResponse<ReadConfirmationDto>>
{
    public Task<ApiResponse<ReadConfirmationDto>> Handle(
        MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo operations + db.SaveChangesAsync(ct)
        var dto = new ReadConfirmationDto(
            Id: 1,
            PageId: request.PageId,
            UserId: currentUser.UserId,
            UserDisplayName: currentUser.DisplayName,
            ReadDate: DateTime.UtcNow,
            ContentVersion: 1);

        return Task.FromResult(ApiResponse<ReadConfirmationDto>.Ok(dto));
    }
}
