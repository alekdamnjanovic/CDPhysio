namespace server.Models.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Service { get; set; }
    public DateTime SubmittedAt { get; set; }
}
