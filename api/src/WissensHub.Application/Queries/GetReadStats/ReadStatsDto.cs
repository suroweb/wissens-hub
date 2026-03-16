namespace WissensHub.Application.Queries.GetReadStats;

public record ReadStatsDto(
    int PageId,
    int TotalTargetUsers,
    int ReadCount,
    int UnreadCount,
    List<UserReadStatusDto> Users);

public record UserReadStatusDto(
    string UserId,
    string DisplayName,
    bool HasRead,
    DateTime? ReadDate);
