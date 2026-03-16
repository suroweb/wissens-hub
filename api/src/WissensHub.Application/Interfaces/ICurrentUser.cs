namespace WissensHub.Application.Interfaces;

public interface ICurrentUser
{
    string UserId { get; }
    string DisplayName { get; }
    string Email { get; }
    IReadOnlyList<string> Groups { get; }
    bool IsInGroup(string groupName);
}
