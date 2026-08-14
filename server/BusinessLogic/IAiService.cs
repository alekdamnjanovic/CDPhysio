namespace server.BusinessLogic;

public interface IAiService
{
    Task<string> GenerateResponseAsync(string prompt);
    IAsyncEnumerable<string> GenerateStreamAsync(string prompt);
}
