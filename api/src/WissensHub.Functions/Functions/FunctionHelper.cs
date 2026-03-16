namespace WissensHub.Functions.Functions;

using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using WissensHub.Application.Common;

internal static class FunctionHelper
{
    public static IActionResult HandleException(Exception ex)
    {
        return ex switch
        {
            ValidationException ve => new BadRequestObjectResult(
                ApiResponse<object>.Fail(
                    ve.Errors.Select(e => new ApiError(e.PropertyName, e.ErrorMessage)).ToList())),
            UnauthorizedAccessException => new ObjectResult(
                ApiResponse<object>.Fail("Insufficient permissions")) { StatusCode = 403 },
            KeyNotFoundException knfe => new NotFoundObjectResult(
                ApiResponse<object>.Fail(knfe.Message)),
            _ => new ObjectResult(
                ApiResponse<object>.Fail("An unexpected error occurred")) { StatusCode = 500 }
        };
    }
}
