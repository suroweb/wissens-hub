namespace WissensHub.Application.Commands.ToggleFavorite;

using MediatR;
using WissensHub.Application.Common;

public record ToggleFavoriteCommand(int PageId) : IRequest<ApiResponse<ToggleFavoriteDto>>;

public record ToggleFavoriteDto(int PageId, bool IsFavorited);
