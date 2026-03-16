using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Queries.GetDashboardStats;

namespace WissensHub.Functions.Functions;

public class DashboardFunctions(IMediator mediator)
{
    [Function("GetDashboardStats")]
    public async Task<IActionResult> GetDashboardStats(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "dashboard/stats")]
        HttpRequest req)
    {
        try
        {
            var result = await mediator.Send(new GetDashboardStatsQuery());
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}
