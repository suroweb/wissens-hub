namespace WissensHub.Application.Queries.GetDashboardStats;

public record DashboardStatsDto(
    int UnreadCount,
    int FavoritesCount,
    int PendingReviewsCount);
