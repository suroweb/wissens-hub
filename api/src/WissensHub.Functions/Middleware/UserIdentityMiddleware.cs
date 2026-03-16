using System.Security.Claims;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.DependencyInjection;
using WissensHub.Application.Interfaces;
using WissensHub.Infrastructure.Services;

namespace WissensHub.Functions.Middleware;

internal sealed class UserIdentityMiddleware : IFunctionsWorkerMiddleware
{
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        if (context.Items.TryGetValue("User", out var userObj) && userObj is ClaimsPrincipal principal)
        {
            var currentUser = context.InstanceServices.GetRequiredService<ICurrentUser>();
            if (currentUser is CurrentUser concreteUser)
            {
                concreteUser.SetFromClaimsPrincipal(principal);
            }
        }

        await next(context);
    }
}
