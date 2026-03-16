namespace WissensHub.Application.Queries.GetFavorites;

using MediatR;
using WissensHub.Application.Common;

public record GetFavoritesQuery() : IRequest<ApiResponse<List<FavoriteDto>>>;
