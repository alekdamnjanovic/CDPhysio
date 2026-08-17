using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.Models.DTOs;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly IRateLimiter _rateLimiter;
    private readonly IConfiguration _configuration;

    public ReviewsController(
        IReviewService reviewService,
        IRateLimiter rateLimiter,
        IConfiguration configuration)
    {
        _reviewService = reviewService;
        _rateLimiter = rateLimiter;
        _configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitReviewRequest request)
    {
        var ipHash = GetClientIpHash();
        var result = await _reviewService.SubmitReviewAsync(request, ipHash, HttpContext.RequestAborted);

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Review submitted for approval.", reviewId = result.Data });
    }

    [HttpGet]
    public async Task<IActionResult> GetApproved()
    {
        var reviews = await _reviewService.GetApprovedReviewsAsync(HttpContext.RequestAborted);
        return Ok(new { reviews });
    }

    [HttpGet("admin")]
    public async Task<IActionResult> ListAdmin([FromQuery] ReviewStatus? status)
    {
        var authFailure = CheckAdminAuth();
        if (authFailure is not null) return authFailure;

        var reviews = await _reviewService.GetAdminReviewsAsync(status, HttpContext.RequestAborted);
        return Ok(new { reviews });
    }

    [HttpPatch("admin/{id:int}")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateReviewStatusRequest request)
    {
        var authFailure = CheckAdminAuth();
        if (authFailure is not null) return authFailure;

        var result = await _reviewService.UpdateReviewStatusAsync(id, request.Status, HttpContext.RequestAborted);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { error = result.ErrorMessage });
        }

        return Ok(new { message = $"Review {request.Status.ToString().ToLowerInvariant()}." });
    }

    [HttpDelete("admin/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var authFailure = CheckAdminAuth();
        if (authFailure is not null) return authFailure;

        var result = await _reviewService.DeleteReviewAsync(id, HttpContext.RequestAborted);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { error = result.ErrorMessage });
        }

        return Ok(new { message = "Review deleted." });
    }

    private IActionResult? CheckAdminAuth()
    {
        if (IsAdminAuthorized()) return null;

        var ipKey = GetClientIpHash();
        var maxAttempts = _configuration.GetValue<int>("Reviews:AdminMaxAttempts", 5);
        var windowMinutes = _configuration.GetValue<int>("Reviews:AdminLockoutMinutes", 10);

        if (!_rateLimiter.IsAllowed($"admin-auth:{ipKey}", maxAttempts, TimeSpan.FromMinutes(windowMinutes)))
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new { error = "Too many failed attempts. Please wait a few minutes." });
        }

        return Unauthorized(new { error = "Invalid or missing admin key." });
    }

    private bool IsAdminAuthorized()
    {
        var expected = _configuration["Reviews:AdminKey"];
        if (string.IsNullOrEmpty(expected)) return false;

        var provided = Request.Headers["X-Admin-Key"].ToString();
        if (string.IsNullOrEmpty(provided)) return false;

        var providedBytes = Encoding.UTF8.GetBytes(provided);
        var expectedBytes = Encoding.UTF8.GetBytes(expected);

        return providedBytes.Length == expectedBytes.Length
            && CryptographicOperations.FixedTimeEquals(providedBytes, expectedBytes);
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
}
