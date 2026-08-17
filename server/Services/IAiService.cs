namespace server.Services;

public interface IAiService
{
    Task<string> GenerateResponseAsync(string prompt);
    IAsyncEnumerable<string> GenerateStreamAsync(string prompt);
}
