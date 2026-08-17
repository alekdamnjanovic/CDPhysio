namespace server.Models.DTOs;

public class ReviewAdminDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Service { get; set; }
    public ReviewStatus Status { get; set; }
    public string? FlaggedReason { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
