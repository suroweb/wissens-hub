namespace WissensHub.Application.Queries.GetFavorites;

public record FavoriteDto(
    int PageId,
    string Title,
    string Category,
    DateTime FavoritedAt);
