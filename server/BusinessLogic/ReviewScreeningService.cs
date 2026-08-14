using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using server.Constants;

namespace server.BusinessLogic;

public class ReviewScreeningService : IReviewScreeningService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<ReviewScreeningService> _logger;

    public ReviewScreeningService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<ReviewScreeningService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(20);
        _baseUrl = (configuration["Ai:BaseUrl"] ?? "https://api.groq.com/openai/v1").TrimEnd('/');
        _apiKey = configuration["Ai:ApiKey"] ?? "";
        _model = configuration["Ai:Model"] ?? ClinicConstants.DefaultModel;
        _logger = logger;
    }

    public async Task<ReviewScreeningResult> ScreenAsync(string name, string text, CancellationToken cancellationToken)
    {
        var prompt =
            $"You are a content moderator for {ClinicConstants.ClinicName}, a physiotherapy clinic website. " +
            "A visitor has submitted a review. Determine whether the review is appropriate to publish. " +
            "It should be rejected if it contains profanity, hate speech, harassment, spam, promotional links, or is otherwise off-topic. " +
            $"Reviewer name: \"{name}\"\nReview text: \"{text}\"\n\n" +
            "Respond with ONLY a single JSON object in this exact format, with no other text:\n" +
            "{\"isAppropriate\": true, \"reason\": \"\"}\n" +
            "Set isAppropriate to false if the review should be flagged, and set reason to a short phrase describing why.";

        var request = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = "You are a strict but fair content moderator. Always respond with valid JSON only." },
                new { role = "user", content = prompt }
            },
            stream = false,
            response_format = new { type = "json_object" },
            temperature = 0
        };

        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/chat/completions")
        {
            Content = content
        };
        if (!string.IsNullOrEmpty(_apiKey))
        {
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(15));

            var response = await _httpClient.SendAsync(requestMessage, cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                // Fail open: never block a review because the AI screening was unavailable.
                _logger.LogWarning(
                    "AI screening unavailable: provider returned {Status} for model {Model}. Review approved without screening.",
                    (int)response.StatusCode, _model);
                return new ReviewScreeningResult(true, null, false);
            }

            var json = await response.Content.ReadAsStringAsync(cts.Token);

            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("choices", out var choices) ||
                choices.ValueKind != JsonValueKind.Array ||
                choices.GetArrayLength() == 0 ||
                !choices[0].TryGetProperty("message", out var message) ||
                !message.TryGetProperty("content", out var textEl) ||
                textEl.ValueKind != JsonValueKind.String)
            {
                _logger.LogWarning("AI screening returned an unexpected response for model {Model}. Review approved without screening.", _model);
                return new ReviewScreeningResult(true, null, false);
            }

            var raw = textEl.GetString() ?? string.Empty;
            var parsed = JsonSerializer.Deserialize<ScreeningJson>(raw);

            if (parsed is null)
            {
                _logger.LogWarning("AI screening response could not be parsed for model {Model}. Review approved without screening.", _model);
                return new ReviewScreeningResult(true, null, false);
            }

            return new ReviewScreeningResult(parsed.IsAppropriate, parsed.Reason, true);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("AI screening timed out for model {Model}. Review approved without screening.", _model);
            return new ReviewScreeningResult(true, null, false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI screening failed for model {Model}. Review approved without screening.", _model);
            return new ReviewScreeningResult(true, null, false);
        }
    }

    private sealed class ScreeningJson
    {
        public bool IsAppropriate { get; set; }
        public string? Reason { get; set; }
    }
}