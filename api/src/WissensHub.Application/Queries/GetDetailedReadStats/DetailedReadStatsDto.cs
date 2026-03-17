namespace WissensHub.Application.Queries.GetDetailedReadStats;

using WissensHub.Application.Queries.GetReadStats;

public record DetailedReadStatsDto(
    int PageId,
    string Title,
    int TotalTargetUsers,
    int ReadCount,
    int UnreadCount,
    List<UserReadStatusDto> Users);
