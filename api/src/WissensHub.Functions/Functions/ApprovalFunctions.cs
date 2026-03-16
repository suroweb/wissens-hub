using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Commands.ApproveArticle;

namespace WissensHub.Functions.Functions;

public class ApprovalFunctions(IMediator mediator)
{
    [Function("ApproveArticle")]
    public async Task<IActionResult> ApproveArticle(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "articles/{pageId:int}/approve")]
        HttpRequest req, int pageId)
    {
        try
        {
            var body = await System.Text.Json.JsonSerializer.DeserializeAsync<ApproveArticleRequest>(req.Body);
            var result = await mediator.Send(new ApproveArticleCommand(
                pageId, body?.Action ?? string.Empty, body?.Comment));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}

internal record ApproveArticleRequest(string Action, string? Comment);
