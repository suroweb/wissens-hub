using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Queries.GetFavorites;
using WissensHub.Application.Commands.ToggleFavorite;

namespace WissensHub.Functions.Functions;

public class FavoriteFunctions(IMediator mediator)
{
    [Function("GetFavorites")]
    public async Task<IActionResult> GetFavorites(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "favorites")]
        HttpRequest req)
    {
        try
        {
            var result = await mediator.Send(new GetFavoritesQuery());
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("ToggleFavorite")]
    public async Task<IActionResult> ToggleFavorite(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "favorites/{pageId:int}")]
        HttpRequest req, int pageId)
    {
        try
        {
            var result = await mediator.Send(new ToggleFavoriteCommand(pageId));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}
