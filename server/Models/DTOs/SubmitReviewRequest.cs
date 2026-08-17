namespace server.Models.DTOs;

public record SubmitReviewRequest(
    string Name,
    int Rating,
    string Text,
    string? Service,
    string? Honeypot
);
