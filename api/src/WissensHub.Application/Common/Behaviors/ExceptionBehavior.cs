using MediatR;
using Microsoft.Extensions.Logging;

namespace WissensHub.Application.Common.Behaviors;

public class ExceptionBehavior<TRequest, TResponse>(
    ILogger<ExceptionBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        try
        {
            return await next();
        }
        catch (FluentValidation.ValidationException ex)
        {
            logger.LogWarning(ex, "Validation failed for {RequestName}", typeof(TRequest).Name);
            throw;
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Authorization failed for {RequestName}", typeof(TRequest).Name);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception in {RequestName} {@Request}", typeof(TRequest).Name, request);
            throw;
        }
    }
}
