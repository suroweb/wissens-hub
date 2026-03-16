namespace WissensHub.Application.Commands.MarkAsRead;

using MediatR;
using WissensHub.Application.Common;

public record MarkAsReadCommand(int PageId) : IRequest<ApiResponse<ReadConfirmationDto>>;

public record ReadConfirmationDto(
    int Id,
    int PageId,
    string UserId,
    string UserDisplayName,
    DateTime ReadDate,
    int ContentVersion);
