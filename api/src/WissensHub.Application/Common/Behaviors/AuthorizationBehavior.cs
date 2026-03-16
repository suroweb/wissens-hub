using System.Reflection;
using MediatR;
using WissensHub.Application.Common.Attributes;
using WissensHub.Application.Interfaces;

namespace WissensHub.Application.Common.Behaviors;

public class AuthorizationBehavior<TRequest, TResponse>(
    ICurrentUser currentUser)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var attributes = typeof(TRequest).GetCustomAttributes<RequireGroupAttribute>();

        foreach (var attr in attributes)
        {
            if (!currentUser.IsInGroup(attr.GroupName))
            {
                throw new UnauthorizedAccessException(
                    $"User is not a member of required group: {attr.GroupName}");
            }
        }

        return await next();
    }
}
