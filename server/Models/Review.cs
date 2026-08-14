namespace server.Models;

public enum ReviewStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public class Review
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Service { get; set; }
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    public string? FlaggedReason { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ClientIpHash { get; set; }
}