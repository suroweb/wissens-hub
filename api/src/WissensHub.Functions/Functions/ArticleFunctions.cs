using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Commands.FlagArticle;
using WissensHub.Application.Commands.MarkAsRead;
using WissensHub.Application.Queries.GetArticleStatus;
using WissensHub.Application.Queries.GetUnreadArticles;

namespace WissensHub.Functions.Functions;

public class ArticleFunctions(IMediator mediator)
{
    [Function("GetArticleStatus")]
    public async Task<IActionResult> GetArticleStatus(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "articles/{pageId:int}/status")]
        HttpRequest req, int pageId)
    {
        try
        {
            var result = await mediator.Send(new GetArticleStatusQuery(pageId));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("GetUnreadArticles")]
    public async Task<IActionResult> GetUnreadArticles(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "articles/unread")]
        HttpRequest req)
    {
        try
        {
            var result = await mediator.Send(new GetUnreadArticlesQuery());
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("MarkAsRead")]
    public async Task<IActionResult> MarkAsRead(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "articles/{pageId:int}/read")]
        HttpRequest req, int pageId)
    {
        try
        {
            var result = await mediator.Send(new MarkAsReadCommand(pageId));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("FlagArticle")]
    public async Task<IActionResult> FlagArticle(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "articles/{pageId:int}/flag")]
        HttpRequest req, int pageId)
    {
        try
        {
            var body = await System.Text.Json.JsonSerializer.DeserializeAsync<FlagArticleRequest>(req.Body, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var result = await mediator.Send(new FlagArticleCommand(pageId, body?.Reason ?? string.Empty));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}

internal record FlagArticleRequest(string Reason);
