using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Services;

namespace server.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(
                    new System.Text.Json.Serialization.JsonStringEnumConverter());
            });

        services.AddHttpClient();
        services.AddOpenApi();

        // Register domain & infrastructure services
        services.AddScoped<IAiService, AiService>();
        services.AddScoped<IReviewScreeningService, ReviewScreeningService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddSingleton<IRateLimiter, RateLimiter>();

        // Register database context
        var connectionString = configuration.GetConnectionString("Default")
            ?? "Host=localhost;Database=cdphysio;Username=postgres;Password=postgres";
        services.AddDbContext<ReviewDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Configure CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        return services;
    }
}
