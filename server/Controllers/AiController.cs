using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using server.BusinessLogic;
namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new { error = "Prompt is required." });
        }

        try
        {
            var response = await _aiService.GenerateResponseAsync(request.Prompt);
            return Ok(new { response });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("chat/stream")]
    public async Task StreamChat([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            Response.StatusCode = 400;
            await Response.WriteAsJsonAsync(new { error = "Prompt is required." });
            return;
        }

        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";

        try
        {
            await foreach (var token in _aiService.GenerateStreamAsync(request.Prompt))
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
}
public record ChatRequest(string Prompt);
