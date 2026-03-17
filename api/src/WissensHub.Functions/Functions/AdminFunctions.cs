using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using WissensHub.Application.Commands.CreateCategory;
using WissensHub.Application.Commands.UpdateCategory;
using WissensHub.Application.Commands.DeleteCategory;
using WissensHub.Application.Commands.CreateTargetGroup;
using WissensHub.Application.Commands.UpdateTargetGroup;
using WissensHub.Application.Commands.DeleteTargetGroup;
using WissensHub.Application.Commands.UpdateReminderInterval;
using WissensHub.Application.Queries.GetAdminReports;
using WissensHub.Application.Queries.GetAllCategories;
using WissensHub.Application.Queries.GetAllTargetGroups;
using WissensHub.Application.Queries.GetReminderInterval;
using WissensHub.Application.Queries.GetDetailedReadStats;

namespace WissensHub.Functions.Functions;

public class AdminFunctions(IMediator mediator)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    // --- Admin Reports ---

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

    [Function("GetDetailedReadStats")]
    public async Task<IActionResult> GetDetailedReadStats(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "management/reports/{pageId:int}")]
        HttpRequest req, int pageId)
    {
        try
        {
            var result = await mediator.Send(new GetDetailedReadStatsQuery(pageId));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    // --- Categories ---

    [Function("GetAllCategories")]
    public async Task<IActionResult> GetAllCategories(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "administration/categories")]
        HttpRequest req)
    {
        try
        {
            var result = await mediator.Send(new GetAllCategoriesQuery());
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("CreateCategory")]
    public async Task<IActionResult> CreateCategory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "administration/categories")]
        HttpRequest req)
    {
        try
        {
            var command = await JsonSerializer.DeserializeAsync<CreateCategoryCommand>(
                req.Body, JsonOptions);
            var result = await mediator.Send(command!);
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("UpdateCategory")]
    public async Task<IActionResult> UpdateCategory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "administration/categories/{id:int}")]
        HttpRequest req, int id)
    {
        try
        {
            var body = await JsonSerializer.DeserializeAsync<UpdateCategoryCommand>(
                req.Body, JsonOptions);
            var command = body! with { Id = id };
            var result = await mediator.Send(command);
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("DeleteCategory")]
    public async Task<IActionResult> DeleteCategory(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "administration/categories/{id:int}")]
        HttpRequest req, int id)
    {
        try
        {
            var result = await mediator.Send(new DeleteCategoryCommand(id));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    // --- Target Groups ---

    [Function("GetAllTargetGroups")]
    public async Task<IActionResult> GetAllTargetGroups(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "administration/target-groups")]
        HttpRequest req)
    {
        try
        {
            var result = await mediator.Send(new GetAllTargetGroupsQuery());
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("CreateTargetGroup")]
    public async Task<IActionResult> CreateTargetGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "administration/target-groups")]
        HttpRequest req)
    {
        try
        {
            var command = await JsonSerializer.DeserializeAsync<CreateTargetGroupCommand>(
                req.Body, JsonOptions);
            var result = await mediator.Send(command!);
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("UpdateTargetGroup")]
    public async Task<IActionResult> UpdateTargetGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "administration/target-groups/{id:int}")]
        HttpRequest req, int id)
    {
        try
        {
            var body = await JsonSerializer.DeserializeAsync<UpdateTargetGroupCommand>(
                req.Body, JsonOptions);
            var command = body! with { Id = id };
            var result = await mediator.Send(command);
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("DeleteTargetGroup")]
    public async Task<IActionResult> DeleteTargetGroup(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "administration/target-groups/{id:int}")]
        HttpRequest req, int id)
    {
        try
        {
            var result = await mediator.Send(new DeleteTargetGroupCommand(id));
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    // --- Reminder Interval ---

    [Function("GetReminderInterval")]
    public async Task<IActionResult> GetReminderInterval(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "administration/reminder-interval")]
        HttpRequest req)
    {
        try
        {
            var result = await mediator.Send(new GetReminderIntervalQuery());
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }

    [Function("UpdateReminderInterval")]
    public async Task<IActionResult> UpdateReminderInterval(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "administration/reminder-interval")]
        HttpRequest req)
    {
        try
        {
            var command = await JsonSerializer.DeserializeAsync<UpdateReminderIntervalCommand>(
                req.Body, JsonOptions);
            var result = await mediator.Send(command!);
            return new OkObjectResult(result);
        }
        catch (Exception ex) { return FunctionHelper.HandleException(ex); }
    }
}
