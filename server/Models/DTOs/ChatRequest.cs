namespace server.Models.DTOs;

public record ChatItemDto(
    string Role,
    string Content
);

public record ChatRequest(
    string? Prompt,
    List<ChatItemDto>? Messages = null
);

