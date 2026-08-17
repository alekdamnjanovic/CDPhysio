namespace server.Services;

public interface IRateLimiter
{
    bool IsAllowed(string key, int maxPerWindow, TimeSpan window);
}
