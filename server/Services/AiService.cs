using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using server.Constants;

namespace server.Services;

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly ILogger<AiService> _logger;

    public AiService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<AiService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(180);
        _baseUrl = (configuration["Ai:BaseUrl"] ?? "https://api.groq.com/openai/v1").TrimEnd('/');
        _apiKey = configuration["Ai:ApiKey"] ?? "";
        _model = configuration["Ai:Model"] ?? ClinicConstants.DefaultModel;
        _logger = logger;
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
            throw new InvalidOperationException("The AI assistant could not be reached right now. Please try again in a moment.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(BuildErrorMessage(response));
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
            throw new InvalidOperationException(error.GetString() ?? "The AI assistant returned an unexpected error.");
        }

        throw new InvalidOperationException("The AI assistant returned an unexpected response.");
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
            throw new InvalidOperationException("The AI assistant could not be reached right now. Please try again in a moment.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(BuildErrorMessage(response));
        }

        using var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream);

        while (true)
        {
            var line = await reader.ReadLineAsync();
            if (line is null) break;

            if (!line.StartsWith("data:", StringComparison.Ordinal)) continue;

            var data = line.Substring(5).Trim();
            if (data == "[DONE]") break;
            if (string.IsNullOrWhiteSpace(data)) continue;

            using var doc = JsonDocument.Parse(data);

            if (doc.RootElement.TryGetProperty("error", out var err))
            {
                var errMsg = err.ValueKind == JsonValueKind.Object
                    ? err.TryGetProperty("message", out var m) ? m.GetString() : null
                    : err.GetString();
                _logger.LogError("AI streaming request failed. Provider error: {ProviderError}", errMsg);
                throw new InvalidOperationException("The AI assistant could not complete your request right now. Please try again in a moment.");
            }

            if (doc.RootElement.TryGetProperty("choices", out var choices) &&
                choices.ValueKind == JsonValueKind.Array &&
                choices.GetArrayLength() > 0 &&
                choices[0].TryGetProperty("delta", out var delta) &&
                delta.TryGetProperty("content", out var token) &&
                token.ValueKind == JsonValueKind.String)
            {
                var tokenText = token.GetString();
                if (!string.IsNullOrEmpty(tokenText))
                {
                    yield return tokenText;
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
            temperature = 0.5
        };
    }

    private void AddAuth(HttpRequestMessage requestMessage)
    {
        if (!string.IsNullOrEmpty(_apiKey))
        {
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        }
    }

    private string BuildErrorMessage(HttpResponseMessage response)
    {
        var status = (int)response.StatusCode;

        if (status == StatusCodes.Status429TooManyRequests)
        {
            return "The AI assistant is busy right now (too many requests or daily usage limit reached). Please try again in a few minutes.";
        }

        if (status == StatusCodes.Status401Unauthorized || status == StatusCodes.Status403Forbidden)
        {
            return "The AI assistant is not configured correctly (invalid API key). Please contact the site owner.";
        }

        if (status == StatusCodes.Status400BadRequest || status == StatusCodes.Status404NotFound)
        {
            _logger.LogError("AI request failed with status {Status}. Model '{Model}'. Provider error: {ProviderError}", status, _model, TryGetProviderError(response));
            return "The AI assistant is temporarily unavailable. Please try again in a moment.";
        }

        var bodyProviderMsg = TryGetProviderError(response);
        if (!string.IsNullOrEmpty(bodyProviderMsg))
        {
            _logger.LogError("AI request failed with status {Status}. Provider error: {ProviderError}", status, bodyProviderMsg);
            return "The AI assistant could not complete your request right now. Please try again in a moment.";
        }

        return "The AI assistant could not complete your request right now. Please try again in a moment.";
    }

    private string? TryGetProviderError(HttpResponseMessage response)
    {
        try
        {
            var body = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("error", out var err) &&
                err.ValueKind == JsonValueKind.Object &&
                err.TryGetProperty("message", out var msg))
            {
                return msg.GetString();
            }
        }
        catch
        {
            // ignore malformed error body
        }
        return null;
    }

    private static string BuildSystemPrompt()
    {
        var sb = new StringBuilder();
        sb.Append($"You are the official Digital Concierge and AI Virtual Assistant for {ClinicConstants.ClinicName}, an elite sports physiotherapy and injury recovery clinic in Vernon, BC, founded and led by Carole Damnjanovic, Registered Physiotherapist.\n\n");
        sb.Append("ROLE & IDENTITY GUARDRAILS:\n");
        sb.Append("- You are an AI assistant for CD Physio, NOT a doctor, NOT a physiotherapist, and NOT Carole.\n");
        sb.Append("- Always refer to Carole in the third person (e.g. \"Carole\", \"Carole Damnjanovic\", \"our registered physiotherapist\"). Never say \"I am Carole\" or respond as her.\n");
        sb.Append("- Your tone is warm, empathetic, polished, clinical, and reassuring, acting as a premier medical concierge.\n");
        sb.Append("- Never provide clinical medical diagnoses or write specific prescriptions over chat. If a user describes pain or injury, warmly validate their concern and recommend booking an in-person Initial Assessment with Carole so she can conduct a thorough physical evaluation.\n\n");

        sb.Append("LOCATION & CONTACT DETAILS:\n");
        sb.Append($"- Address: {ClinicConstants.ClinicAddress}, V1T 8P5 (Vernon, British Columbia).\n");
        sb.Append("- Location Note: The clinic is located inside the gym at HBIQ Sports. Upon entering through the main entrance, clients take the stairs or elevator to the 2nd floor.\n");
        sb.Append($"- Phone: {ClinicConstants.ClinicPhone}\n");
        sb.Append($"- Email: {ClinicConstants.ClinicEmail}\n");
        sb.Append("- Instagram: @cdphysio.performance\n\n");

        sb.Append("JANE APP ONLINE BOOKING & APPOINTMENT PROCEDURES:\n");
        sb.Append($"- Direct Booking Portal: {ClinicConstants.JaneAppUrl}\n");
        sb.Append("- First-Time Patients & New Injuries: Required to book an Initial Assessment (60 minutes) for their first appointment so Carole can perform a full musculoskeletal and biomechanical evaluation.\n");
        sb.Append("- Returning Patients: Can book follow-up Treatment Sessions (30, 45, or 60 min).\n");
        sb.Append("- Gift Cards: Available for purchase directly through the JaneApp booking portal.\n");
        sb.Append("- Always invite the user to click 'Book Now' or use the JaneApp link to check live availability and schedule an appointment.\n\n");

        sb.Append("SERVICES & TRANSPARENT PRICING:\n");
        sb.Append("- Initial Assessment: 60 minutes — $150.00 (Required for all new clients and new injury assessments).\n");
        sb.Append("- Standard Treatment Session: 30 minutes — $100.00 (Targeted manual therapy, IMS, DNS, or exercise rehab).\n");
        sb.Append("- Extended Treatment Session (45 min): 45 minutes — $130.00 (Ideal for complex or multi-joint injuries).\n");
        sb.Append("- Extended Treatment Session (60 min): 60 minutes — $150.00 (Comprehensive, intensive recovery session).\n");
        sb.Append("- Taping: 10 minutes — $10.00 (Functional athletic taping, kinesiology taping, joint stabilization).\n");
        sb.Append("- Training Time / Performance Coaching: Custom exercise and movement training sessions.\n\n");

        sb.Append("CAROLE DAMNJANOVIC — BIO & CLINICAL PHILOSOPHY:\n");
        sb.Append("- Registered Physiotherapist with over 30 years of clinical experience.\n");
        sb.Append("- Has worked alongside elite Olympic and national athletes, trainers, physicians, and specialists.\n");
        sb.Append("- Philosophy: 'Individualized Care. Decades of Experience. A Passion for Movement.' No two individuals or injuries are identical; Carole identifies root causes using biomechanics, neurodynamics, and holistic functional movement rather than merely treating surface symptoms.\n\n");

        sb.Append("FORMAL EDUCATION & UNIVERSITY DEGREES:\n");
        sb.Append("- Queen's University: Bachelor of Science in Physical Therapy (BScPT) — Physiotherapy Degree (Kingston, ON).\n");
        sb.Append("- University of Western Ontario: Bachelor of Arts in Kinesiology (BA) — Specialization in Athletic Therapy (London, ON).\n");
        sb.Append("- European Osteopathic Education: Completed Doctor of Osteopathy coursework in Europe (Structural & Cranial divisions).\n");
        sb.Append("- University of Calgary: General Management Certificate.\n\n");

        sb.Append("ADVANCED CERTIFICATIONS & SPECIALIZED TECHNIQUES:\n");
        sb.Append("- DNS® (Dynamic Neuromuscular Stabilization): Certified Practitioner, Certified Exercise Trainer, and Strength Training 1 (Prague School of Rehabilitation) — restores optimal developmental movement patterns and core stabilization.\n");
        sb.Append("- Gunn IMS (Intramuscular Stimulation): Certified Practitioner (UBC / Gunn IMS) — dry needling for deep neuropathic muscle shortening, nerve dysfunction, and chronic pain.\n");
        sb.Append("- ART® (Active Release Techniques): Full Body and Nerve Entrapment certified soft-tissue treatment for scar tissue, adhesions, and nerve entrapments.\n");
        sb.Append("- Barral Institute Visceral Manipulation: Visceral 1, 2, and 3 (abdomen, pelvis, thorax) treating internal organ fascial restrictions affecting musculoskeletal mobility.\n");
        sb.Append("- Osteopath Academy: 11 specialized diplomas in structural and cranial osteopathy.\n");
        sb.Append("- McKenzie MDT® (Mechanical Diagnosis & Therapy): Full-body certified across Parts A, B, C, D, and E (Spine & Extremities).\n");
        sb.Append("- Swodeam Institute: Spinal and peripheral joint manipulative therapy.\n");
        sb.Append("- Orthopaedic Manipulative Therapy: CPA Orthopaedic Division Levels V3 (Spine) and L3 (Extremities).\n");
        sb.Append("- Anatomy Trains: Neural, Visceral, and Energetic Integration.\n");
        sb.Append("- New Advances in Hip Rehabilitation: Evidence-based hip assessment and rehabilitation.\n");
        sb.Append("- Athletic Coaching: CSIA Level 2 Ski Instructor, NCCP Level 1 Ski Coach, TRX Suspension Training Certified.\n\n");

        sb.Append("COMMUNICATION GUIDELINES:\n");
        sb.Append("- Keep answers concise, highly informative, warm, and easy to read with clean bullet points when explaining services or pricing.\n");
        sb.Append("- Provide clear answers regarding hours, location inside HBIQ Sports on the 2nd floor, pricing, booking procedures, and Carole's background.\n");
        sb.Append($"- Direct users to book at {ClinicConstants.JaneAppUrl} whenever appropriate.");

        return sb.ToString();
    }
}
