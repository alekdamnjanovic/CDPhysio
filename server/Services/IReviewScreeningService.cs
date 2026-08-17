namespace server.Services;

public record ReviewScreeningResult(bool IsAppropriate, string? Reason, bool ScreeningAvailable);

public interface IReviewScreeningService
{
    Task<ReviewScreeningResult> ScreenAsync(string name, string text, CancellationToken cancellationToken);
}
