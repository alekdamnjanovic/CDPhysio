using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using server.Models.DTOs;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly IRateLimiter _rateLimiter;

    public AiController(IAiService aiService, IRateLimiter rateLimiter)
    {
        _aiService = aiService;
        _rateLimiter = rateLimiter;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var hasPrompt = !string.IsNullOrWhiteSpace(request.Prompt);
        var hasMessages = request.Messages != null && request.Messages.Count > 0;

        if (!hasPrompt && !hasMessages)
        {
            return BadRequest(new { error = "Prompt or messages are required." });
        }

        var ip = GetClientIp();
        if (!_rateLimiter.IsAllowed($"ai_chat_{ip}", maxPerWindow: 20, window: TimeSpan.FromMinutes(3)))
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new { error = "You're asking questions a bit too fast. Please wait a moment before sending another message." });
        }

        try
        {
            var response = hasMessages
                ? await _aiService.GenerateResponseAsync(request.Messages!)
                : await _aiService.GenerateResponseAsync(request.Prompt!);
            return Ok(new { response });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
        }
    }

    [HttpPost("chat/stream")]
    public async Task StreamChat([FromBody] ChatRequest request)
    {
        var hasPrompt = !string.IsNullOrWhiteSpace(request.Prompt);
        var hasMessages = request.Messages != null && request.Messages.Count > 0;

        if (!hasPrompt && !hasMessages)
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            await Response.WriteAsJsonAsync(new { error = "Prompt or messages are required." });
            return;
        }

        var ip = GetClientIp();
        if (!_rateLimiter.IsAllowed($"ai_stream_{ip}", maxPerWindow: 20, window: TimeSpan.FromMinutes(3)))
        {
            Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await Response.WriteAsJsonAsync(new { error = "You're asking questions a bit too fast. Please wait a moment before sending another message." });
            return;
        }

        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";

        try
        {
            var stream = hasMessages
                ? _aiService.GenerateStreamAsync(request.Messages!)
                : _aiService.GenerateStreamAsync(request.Prompt!);

            await foreach (var token in stream)
            {
                await Response.WriteAsync($"data: {JsonSerializer.Serialize(new { token })}\n\n");
                await Response.Body.FlushAsync();
            }

            await Response.WriteAsync("data: [DONE]\n\n");
            await Response.Body.FlushAsync();
        }
        catch (Exception ex)
        {
            await Response.WriteAsync($"data: {JsonSerializer.Serialize(new { error = ex.Message })}\n\n");
            await Response.Body.FlushAsync();
        }
    }

    private string GetClientIp()
    {
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwarded))
        {
            var ip = forwarded.ToString().Split(',')[0].Trim();
            if (!string.IsNullOrEmpty(ip)) return ip;
        }
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
