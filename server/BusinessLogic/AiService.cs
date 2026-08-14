using System.Text;
using System.Text.Json;
using server.Constants;
namespace server.BusinessLogic;

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _ollamaUrl;

    public AiService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(180);
        _ollamaUrl = configuration["Ollama:BaseUrl"] ?? "http://localhost:11434";
    }

    public async Task<string> GenerateResponseAsync(string prompt)
    {
        var ollamaRequest = new
        {
            model = ClinicConstants.DefaultModel,
            prompt = BuildFullPrompt(prompt),
            stream = false
        };

        var content = new StringContent(JsonSerializer.Serialize(ollamaRequest), Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.PostAsync($"{_ollamaUrl}/api/generate", content);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Could not reach Ollama at {_ollamaUrl}. Please make sure Ollama is running.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Ollama returned {(int)response.StatusCode} for model '{ClinicConstants.DefaultModel}'. " +
                $"The model may not be installed - run 'ollama pull {ClinicConstants.DefaultModel}'.");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);

        if (doc.RootElement.TryGetProperty("response", out var text))
        {
            return text.GetString() ?? string.Empty;
        }

        if (doc.RootElement.TryGetProperty("error", out var error))
        {
            throw new InvalidOperationException(error.GetString() ?? "Ollama returned an error.");
        }

        throw new InvalidOperationException("Ollama returned an unexpected response.");
    }

    public async IAsyncEnumerable<string> GenerateStreamAsync(string prompt)
    {
        var ollamaRequest = new
        {
            model = ClinicConstants.DefaultModel,
            prompt = BuildFullPrompt(prompt),
            stream = true
        };

        var content = new StringContent(JsonSerializer.Serialize(ollamaRequest), Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{_ollamaUrl}/api/generate")
            {
                Content = content
            };
            response = await _httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Could not reach Ollama at {_ollamaUrl}. Please make sure Ollama is running.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Ollama returned {(int)response.StatusCode} for model '{ClinicConstants.DefaultModel}'. " +
                $"The model may not be installed - run 'ollama pull {ClinicConstants.DefaultModel}'.");
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

            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            using var doc = JsonDocument.Parse(line);

            if (doc.RootElement.TryGetProperty("response", out var token))
            {
                var text = token.GetString();
                if (!string.IsNullOrEmpty(text))
                {
                    yield return text;
                }
            }

            if (doc.RootElement.TryGetProperty("done", out var done) && done.GetBoolean())
            {
                break;
            }
        }
    }

    private string BuildFullPrompt(string prompt)
    {
        return $"{BuildSystemPrompt()}\n\nUser: {prompt}\nAssistant:";
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
