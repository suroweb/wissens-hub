namespace WissensHub.Application.Queries.GetFavorites;

using MediatR;
using WissensHub.Application.Common;
using WissensHub.Application.Interfaces;

public class GetFavoritesHandler(ICurrentUser currentUser)
    : IRequestHandler<GetFavoritesQuery, ApiResponse<List<FavoriteDto>>>
{
    public Task<ApiResponse<List<FavoriteDto>>> Handle(
        GetFavoritesQuery request, CancellationToken cancellationToken)
    {
        // Feature phase: replace with real repo query filtered by currentUser
        var favorites = new List<FavoriteDto>
        {
            new(PageId: 2, Title: "Onboarding-Leitfaden", Category: "Personalwesen", FavoritedAt: DateTime.UtcNow.AddDays(-10)),
            new(PageId: 4, Title: "Reisekostenrichtlinie", Category: "Finanzen", FavoritedAt: DateTime.UtcNow.AddDays(-5))
        };

        return Task.FromResult(ApiResponse<List<FavoriteDto>>.Ok(favorites));
    }
}
