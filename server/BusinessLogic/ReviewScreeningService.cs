using System.Text;
using System.Text.Json;
using server.Constants;

namespace server.BusinessLogic;

public class ReviewScreeningService : IReviewScreeningService
{
    private readonly HttpClient _httpClient;
    private readonly string _ollamaUrl;
    private readonly string _model;

    public ReviewScreeningService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(20);
        _ollamaUrl = configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
        _model = configuration["Reviews:Model"] ?? ClinicConstants.DefaultModel;
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

        var ollamaRequest = new
        {
            model = _model,
            prompt,
            stream = false,
            format = "json"
        };

        var content = new StringContent(JsonSerializer.Serialize(ollamaRequest), Encoding.UTF8, "application/json");

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(15));

            var response = await _httpClient.PostAsync($"{_ollamaUrl}/api/generate", content, cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                return new ReviewScreeningResult(true, null, false);
            }

            var json = await response.Content.ReadAsStringAsync(cts.Token);

            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("response", out var textEl))
            {
                return new ReviewScreeningResult(true, null, false);
            }

            var raw = textEl.GetString() ?? string.Empty;
            var parsed = JsonSerializer.Deserialize<ScreeningJson>(raw);

            if (parsed is null)
            {
                return new ReviewScreeningResult(true, null, false);
            }

            return new ReviewScreeningResult(parsed.IsAppropriate, parsed.Reason, true);
        }
        catch
        {
            return new ReviewScreeningResult(true, null, false);
        }
    }

    private sealed class ScreeningJson
    {
        public bool IsAppropriate { get; set; }
        public string? Reason { get; set; }
    }
}