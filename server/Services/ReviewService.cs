using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Models.DTOs;

namespace server.Services;

public class ReviewService : IReviewService
{
    private readonly ReviewDbContext _db;
    private readonly IReviewScreeningService _screening;
    private readonly IRateLimiter _rateLimiter;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(
        ReviewDbContext db,
        IReviewScreeningService screening,
        IRateLimiter rateLimiter,
        IConfiguration configuration,
        ILogger<ReviewService> logger)
    {
        _db = db;
        _screening = screening;
        _rateLimiter = rateLimiter;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ServiceResult<int>> SubmitReviewAsync(
        SubmitReviewRequest request,
        string clientIpHash,
        CancellationToken cancellationToken = default)
    {
        // Silent pass for honeypot bot trap
        if (!string.IsNullOrWhiteSpace(request.Honeypot))
        {
            return ServiceResult<int>.Ok(0);
        }

        var name = request.Name?.Trim() ?? string.Empty;
        var text = request.Text?.Trim() ?? string.Empty;
        var service = string.IsNullOrWhiteSpace(request.Service) ? null : request.Service.Trim();

        if (name.Length is < 2 or > 100)
        {
            return ServiceResult<int>.Fail("Please enter your name (2-100 characters).", StatusCodes.Status400BadRequest);
        }

        if (request.Rating is < 1 or > 5)
        {
            return ServiceResult<int>.Fail("Please select a rating from 1 to 5 stars.", StatusCodes.Status400BadRequest);
        }

        if (text.Length is < 10 or > 600)
        {
            return ServiceResult<int>.Fail("Review must be between 10 and 600 characters.", StatusCodes.Status400BadRequest);
        }

        if (service is { Length: > 100 })
        {
            return ServiceResult<int>.Fail("Service name is too long.", StatusCodes.Status400BadRequest);
        }

        var rateLimitMinutes = _configuration.GetValue<int>("Reviews:RateLimitMinutes", 5);
        var rateLimitMax = _configuration.GetValue<int>("Reviews:MaxPerWindow", 1);
        if (!_rateLimiter.IsAllowed(clientIpHash, rateLimitMax, TimeSpan.FromMinutes(rateLimitMinutes)))
        {
            return ServiceResult<int>.Fail("Please wait a few minutes before submitting another review.", StatusCodes.Status429TooManyRequests);
        }

        var review = new Review
        {
            Name = name,
            Rating = request.Rating,
            Text = text,
            Service = service,
            Status = ReviewStatus.Pending,
            SubmittedAt = DateTime.UtcNow,
            ClientIpHash = clientIpHash
        };

        var screeningEnabled = _configuration.GetValue<bool>("Reviews:EnableAiScreening", true);
        if (screeningEnabled)
        {
            var result = await _screening.ScreenAsync(name, text, cancellationToken);
            if (result.ScreeningAvailable && !result.IsAppropriate)
            {
                review.FlaggedReason = string.IsNullOrWhiteSpace(result.Reason)
                    ? "Flagged by AI screening"
                    : result.Reason;
            }
        }

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(cancellationToken);

        return ServiceResult<int>.Ok(review.Id);
    }

    public async Task<List<ReviewDto>> GetApprovedReviewsAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Reviews
            .AsNoTracking()
            .Where(r => r.Status == ReviewStatus.Approved)
            .OrderByDescending(r => r.ReviewedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                Name = r.Name,
                Rating = r.Rating,
                Text = r.Text,
                Service = r.Service,
                SubmittedAt = r.SubmittedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ReviewAdminDto>> GetAdminReviewsAsync(ReviewStatus? status, CancellationToken cancellationToken = default)
    {
        var query = _db.Reviews.AsNoTracking().AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        return await query
            .OrderByDescending(r => r.SubmittedAt)
            .Select(r => new ReviewAdminDto
            {
                Id = r.Id,
                Name = r.Name,
                Rating = r.Rating,
                Text = r.Text,
                Service = r.Service,
                Status = r.Status,
                FlaggedReason = r.FlaggedReason,
                SubmittedAt = r.SubmittedAt,
                ReviewedAt = r.ReviewedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ServiceResult> UpdateReviewStatusAsync(int id, ReviewStatus status, CancellationToken cancellationToken = default)
    {
        if (status is not (ReviewStatus.Approved or ReviewStatus.Rejected))
        {
            return ServiceResult.Fail("Status must be Approved or Rejected.", StatusCodes.Status400BadRequest);
        }

        var review = await _db.Reviews.FindAsync([id], cancellationToken);
        if (review is null)
        {
            return ServiceResult.Fail("Review not found.", StatusCodes.Status404NotFound);
        }

        review.Status = status;
        review.ReviewedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteReviewAsync(int id, CancellationToken cancellationToken = default)
    {
        var review = await _db.Reviews.FindAsync([id], cancellationToken);
        if (review is null)
        {
            return ServiceResult.Fail("Review not found.", StatusCodes.Status404NotFound);
        }

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(cancellationToken);

        return ServiceResult.Ok();
    }
}
