using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.BusinessLogic;
using server.Data;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ReviewDbContext _db;
    private readonly IReviewScreeningService _screening;
    private readonly IRateLimiter _rateLimiter;
    private readonly IConfiguration _configuration;

    public ReviewsController(
        ReviewDbContext db,
        IReviewScreeningService screening,
        IRateLimiter rateLimiter,
        IConfiguration configuration)
    {
        _db = db;
        _screening = screening;
        _rateLimiter = rateLimiter;
        _configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitReviewRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Honeypot))
        {
            return Ok(new { message = "Review submitted." });
        }

        var name = request.Name?.Trim() ?? string.Empty;
        var text = request.Text?.Trim() ?? string.Empty;
        var service = string.IsNullOrWhiteSpace(request.Service) ? null : request.Service.Trim();

        if (name.Length is < 2 or > 100)
        {
            return BadRequest(new { error = "Please enter your name (2-100 characters)." });
        }

        if (request.Rating is < 1 or > 5)
        {
            return BadRequest(new { error = "Please select a rating from 1 to 5 stars." });
        }

        if (text.Length is < 10 or > 2000)
        {
            return BadRequest(new { error = "Review must be between 10 and 2000 characters." });
        }

        if (service is { Length: > 100 })
        {
            return BadRequest(new { error = "Service name is too long." });
        }

        var ipKey = GetClientIpHash();

        var rateLimitMinutes = _configuration.GetValue<int>("Reviews:RateLimitMinutes", 5);
        var rateLimitMax = _configuration.GetValue<int>("Reviews:MaxPerWindow", 1);
        if (!_rateLimiter.IsAllowed(ipKey, rateLimitMax, TimeSpan.FromMinutes(rateLimitMinutes)))
        {
            return StatusCode(429, new { error = "Please wait a few minutes before submitting another review." });
        }

        var review = new Review
        {
            Name = name,
            Rating = request.Rating,
            Text = text,
            Service = service,
            Status = ReviewStatus.Pending,
            SubmittedAt = DateTime.UtcNow,
            ClientIpHash = ipKey
        };

        var screeningEnabled = _configuration.GetValue<bool>("Reviews:EnableAiScreening", true);
        if (screeningEnabled)
        {
            var result = await _screening.ScreenAsync(name, text, HttpContext.RequestAborted);
            if (result.ScreeningAvailable && !result.IsAppropriate)
            {
                review.FlaggedReason = string.IsNullOrWhiteSpace(result.Reason)
                    ? "Flagged by AI screening"
                    : result.Reason;
            }
        }

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(HttpContext.RequestAborted);

        return Ok(new { message = "Review submitted for approval.", reviewId = review.Id });
    }

    [HttpGet]
    public async Task<IActionResult> GetApproved()
    {
        var reviews = await _db.Reviews
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
            .ToListAsync(HttpContext.RequestAborted);

        return Ok(new { reviews });
    }

    [HttpGet("admin")]
    public async Task<IActionResult> ListAdmin([FromQuery] ReviewStatus? status)
    {
        if (!IsAdminAuthorized())
        {
            return Unauthorized(new { error = "Invalid or missing admin key." });
        }

        var query = _db.Reviews.AsNoTracking().AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        var reviews = await query
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync(HttpContext.RequestAborted);

        return Ok(new { reviews = reviews.Select(ToAdminDto) });
    }

    [HttpPatch("admin/{id:int}")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateReviewStatusRequest request)
    {
        if (!IsAdminAuthorized())
        {
            return Unauthorized(new { error = "Invalid or missing admin key." });
        }

        if (request.Status is not (ReviewStatus.Approved or ReviewStatus.Rejected))
        {
            return BadRequest(new { error = "Status must be Approved or Rejected." });
        }

        var review = await _db.Reviews.FindAsync([id]);
        if (review is null)
        {
            return NotFound(new { error = "Review not found." });
        }

        review.Status = request.Status;
        review.ReviewedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(HttpContext.RequestAborted);

        return Ok(new { message = $"Review {request.Status.ToString().ToLowerInvariant()}." });
    }

    [HttpDelete("admin/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!IsAdminAuthorized())
        {
            return Unauthorized(new { error = "Invalid or missing admin key." });
        }

        var review = await _db.Reviews.FindAsync([id]);
        if (review is null)
        {
            return NotFound(new { error = "Review not found." });
        }

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(HttpContext.RequestAborted);

        return Ok(new { message = "Review deleted." });
    }

    private bool IsAdminAuthorized()
    {
        var expected = _configuration["Reviews:AdminKey"];
        if (string.IsNullOrEmpty(expected))
        {
            return false;
        }
        var provided = Request.Headers["X-Admin-Key"].ToString();
        return !string.IsNullOrEmpty(provided) && provided == expected;
    }

    private string GetClientIpHash()
    {
        var forwarded = Request.Headers["X-Forwarded-For"].ToString();
        var ip = !string.IsNullOrWhiteSpace(forwarded)
            ? forwarded.Split(',')[0].Trim()
            : HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(ip));
        return Convert.ToHexString(bytes);
    }

    private static ReviewAdminDto ToAdminDto(Review r) => new()
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
    };
}

public record SubmitReviewRequest(string Name, int Rating, string Text, string? Service, string? Honeypot);
public record UpdateReviewStatusRequest(ReviewStatus Status);

public class ReviewDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Service { get; set; }
    public DateTime SubmittedAt { get; set; }
}

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