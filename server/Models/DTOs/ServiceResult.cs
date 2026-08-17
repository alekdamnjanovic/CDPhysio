namespace server.Models.DTOs;

public class ServiceResult
{
    public bool Success { get; init; }
    public string? ErrorMessage { get; init; }
    public int StatusCode { get; init; } = 200;

    public static ServiceResult Ok() => new() { Success = true };
    public static ServiceResult Fail(string error, int statusCode = 400) => new()
    {
        Success = false,
        ErrorMessage = error,
        StatusCode = statusCode
    };
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; init; }

    public static ServiceResult<T> Ok(T data) => new() { Success = true, Data = data };
    public static new ServiceResult<T> Fail(string error, int statusCode = 400) => new()
    {
        Success = false,
        ErrorMessage = error,
        StatusCode = statusCode
    };
}
