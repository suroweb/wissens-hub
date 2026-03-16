namespace WissensHub.Application.Common.Attributes;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public class RequireGroupAttribute(string groupName) : Attribute
{
    public string GroupName { get; } = groupName;
}
