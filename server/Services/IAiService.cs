using server.Models.DTOs;

namespace server.Services;

public interface IAiService
{
    Task<string> GenerateResponseAsync(string prompt);
    Task<string> GenerateResponseAsync(IEnumerable<ChatItemDto> messages);
    IAsyncEnumerable<string> GenerateStreamAsync(string prompt);
    IAsyncEnumerable<string> GenerateStreamAsync(IEnumerable<ChatItemDto> messages);
}

