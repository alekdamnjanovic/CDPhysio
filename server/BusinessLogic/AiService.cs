using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using server.Constants;
namespace server.BusinessLogic;

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly string _model;

    public AiService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(180);
        _baseUrl = (configuration["Ai:BaseUrl"] ?? "https://api.groq.com/openai/v1").TrimEnd('/');
        _apiKey = configuration["Ai:ApiKey"] ?? "";
        _model = configuration["Ai:Model"] ?? ClinicConstants.DefaultModel;
    }

    public async Task<string> GenerateResponseAsync(string prompt)
    {
        var request = BuildRequest(prompt, stream: false);

        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/chat/completions")
        {
            Content = content
        };
        AddAuth(requestMessage);

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(requestMessage);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Could not reach the AI provider at {_baseUrl}.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"AI provider returned {(int)response.StatusCode} for model '{_model}'. Check that the API key is valid and the model name is correct.");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        if (doc.RootElement.TryGetProperty("choices", out var choices) &&
            choices.ValueKind == JsonValueKind.Array &&
            choices.GetArrayLength() > 0 &&
            choices[0].TryGetProperty("message", out var message) &&
            message.TryGetProperty("content", out var text) &&
            text.ValueKind == JsonValueKind.String)
        {
            return text.GetString() ?? string.Empty;
        }

        if (doc.RootElement.TryGetProperty("error", out var error))
        {
            throw new InvalidOperationException(error.GetString() ?? "The AI provider returned an error.");
        }

        throw new InvalidOperationException("The AI provider returned an unexpected response.");
    }

    public async IAsyncEnumerable<string> GenerateStreamAsync(string prompt)
    {
        var request = BuildRequest(prompt, stream: true);

        var content = new StringContent(JsonSerializer.Serialize(request), Encoding.UTF8, "application/json");
        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/chat/completions")
        {
            Content = content
        };
        AddAuth(requestMessage);

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Could not reach the AI provider at {_baseUrl}.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"AI provider returned {(int)response.StatusCode} for model '{_model}'. Check that the API key is valid and the model name is correct.");
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream);

        while (true)
        {
            var line = await reader.ReadLineAsync();
            if (line is null)
            {
                break;
            }

            if (!line.StartsWith("data:", StringComparison.Ordinal))
            {
                continue;
            }

            var data = line.Substring(5).Trim();
            if (data == "[DONE]")
            {
                break;
            }

            if (string.IsNullOrWhiteSpace(data))
            {
                continue;
            }

            using var doc = JsonDocument.Parse(data);

            if (doc.RootElement.TryGetProperty("choices", out var choices) &&
                choices.ValueKind == JsonValueKind.Array &&
                choices.GetArrayLength() > 0 &&
                choices[0].TryGetProperty("delta", out var delta) &&
                delta.TryGetProperty("content", out var token) &&
                token.ValueKind == JsonValueKind.String)
            {
                var text = token.GetString();
                if (!string.IsNullOrEmpty(text))
                {
                    yield return text;
                }
            }
        }
    }

    private object BuildRequest(string prompt, bool stream)
    {
        return new
        {
            model = _model,
            messages = new[]
            {
                new { role = "system", content = BuildSystemPrompt() },
                new { role = "user", content = prompt }
            },
            stream,
            temperature = 0.6
        };
    }

    private void AddAuth(HttpRequestMessage requestMessage)
    {
        if (!string.IsNullOrEmpty(_apiKey))
        {
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }
    }

    private string BuildSystemPrompt()
    {
        return $"You are the AI-powered Virtual Assistant for {ClinicConstants.ClinicName}, a professional sports physiotherapy clinic in Vernon, BC owned by physiotherapist Carole Damnjanovic. " +
               "IMPORTANT: You are an artificial intelligence assistant — you are NOT a physiotherapist and you are NOT Carole or any clinic staff member. " +
               "Always refer to Carole and the clinic in the third person (e.g. \"Carole\", \"the physiotherapist\", \"the clinic\"). Never respond as if you are Carole, never say \"I am Carole\", and never sign messages as her. " +
               "If a user asks to speak with or see Carole directly, explain that you are an AI assistant and invite them to book an appointment through the booking button on the site so they can meet Carole in person. " +
               $"Clinic Info: Located inside HBIQ Sports ({ClinicConstants.ClinicAddress}). Email is {ClinicConstants.ClinicEmail}, phone is {ClinicConstants.ClinicPhone}. " +
               "Carole's background: Decades of experience working side-by-side with elite athletes, trainers, and physicians. " +
               "Education: Physiotherapy (BScPT) from Queen's University and Kinesiology with a specialization in Athletic Therapy (BA) from the University of Western Ontario. " +
               "Certifications: DNS (Dynamic Neuromuscular Stabilization) Certified Practitioner and Certified Exercise Trainer, Gunn IMS (Intramuscular Stimulation) Certified Practitioner, ART (Active Release Techniques, full body and nerve entrapment), Barral Institute visceral courses (abdomen, pelvis, thorax), Osteopath Academy (structural and cranial divisions), McKenzie Method (MDT, full body), Swodeam Institute (spinal and peripheral manipulative therapy), Orthopaedic Manipulative Therapy (Levels V3 spine and L3 extremities), Anatomy Trains (Thoracolumbar Junction; Neural, Visceral and Energetic Integration), New Advances in Hip Rehabilitation, and a General Management Certificate from the University of Calgary. " +
               "Athletics & Coaching: CSIA Level 2 ski instructor, NCCP Level 1 ski coach, TRX certified. " +
               "Services & Pricing: Initial Assessment (60 minutes) is $150. Treatment sessions are $100 for 30 minutes, $130 for 45 minutes, or $150 for 60 minutes. " +
               $"Always invite the user to click the booking button on the site (the \"Book on JaneApp\" or \"Book Now\" buttons) to secure a time slot on the official JaneApp scheduling system ({ClinicConstants.JaneAppUrl}), which handles all booking and pricing. " +
               "Keep responses short, warm, supportive, and professional. Never offer medical diagnoses or prescriptions — for personal advice always recommend booking an initial assessment.";
    }
}