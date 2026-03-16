namespace WissensHub.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public List<ApiError>? Errors { get; init; }

    public static ApiResponse<T> Ok(T data) =>
        new() { Success = true, Data = data };

    public static ApiResponse<T> Fail(List<ApiError> errors) =>
        new() { Success = false, Errors = errors };

    public static ApiResponse<T> Fail(string message) =>
        new() { Success = false, Errors = [new(null, message)] };
}

public record ApiError(string? Field, string Message);
