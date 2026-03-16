using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Commands.ApproveArticle;
using WissensHub.Application.Queries.GetApprovalHistory;

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
            var body = await System.Text.Json.JsonSerializer.DeserializeAsync<ApproveArticleRequest>(req.Body, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var result = await mediator.Send(new ApproveArticleCommand(
                pageId, body?.Action ?? string.Empty, body?.Comment));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
    [Function("GetApprovalHistory")]
    public async Task<IActionResult> GetApprovalHistory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "articles/{pageId:int}/history")]
        HttpRequest req, int pageId)
    {
        try
        {
            var result = await mediator.Send(new GetApprovalHistoryQuery(pageId));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}

internal record ApproveArticleRequest(string Action, string? Comment);
