using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Queries.GetReadStats;

namespace WissensHub.Functions.Functions;

public class ReadStatsFunctions(IMediator mediator)
{
    [Function("GetReadStats")]
    public async Task<IActionResult> GetReadStats(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "articles/{pageId:int}/readstats")]
        HttpRequest req, int pageId)
    {
        try
        {
            var result = await mediator.Send(new GetReadStatsQuery(pageId));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}
