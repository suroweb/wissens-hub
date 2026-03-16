namespace WissensHub.Application.Commands.ToggleFavorite;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class ToggleFavoriteHandler(ICurrentUser currentUser)
    : IRequestHandler<ToggleFavoriteCommand, ApiResponse<ToggleFavoriteDto>>
{
    public Task<ApiResponse<ToggleFavoriteDto>> Handle(
        ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo operations + db.SaveChangesAsync(ct)
        var dto = new ToggleFavoriteDto(
            PageId: request.PageId,
            IsFavorited: true);

        return Task.FromResult(ApiResponse<ToggleFavoriteDto>.Ok(dto));
    }
}
