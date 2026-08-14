namespace server.BusinessLogic;

public interface IReviewScreeningService
{
    Task<ReviewScreeningResult> ScreenAsync(string name, string text, CancellationToken cancellationToken);
}

public record ReviewScreeningResult(bool IsAppropriate, string? Reason, bool ScreeningAvailable);