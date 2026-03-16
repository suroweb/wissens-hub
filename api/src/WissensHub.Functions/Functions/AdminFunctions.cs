using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Queries.GetAdminReports;

namespace WissensHub.Functions.Functions;

public class AdminFunctions(IMediator mediator)
{
    [Function("GetAdminReports")]
    public async Task<IActionResult> GetAdminReports(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/reports")]
        HttpRequest req)
    {
        try
        {
            var result = await mediator.Send(new GetAdminReportsQuery());
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}
