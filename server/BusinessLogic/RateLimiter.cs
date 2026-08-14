using System.Collections.Concurrent;

namespace server.BusinessLogic;

public interface IRateLimiter
{
    bool IsAllowed(string key, int maxPerWindow, TimeSpan window);
}

public class RateLimiter : IRateLimiter
{
    private readonly ConcurrentDictionary<string, (int Count, DateTime WindowStart)> _entries = new();

    public bool IsAllowed(string key, int maxPerWindow, TimeSpan window)
    {
        var now = DateTime.UtcNow;
        var entry = _entries.AddOrUpdate(
            key,
            _ => (1, now),
            (_, existing) =>
            {
                if (now - existing.WindowStart >= window)
                {
                    return (1, now);
                }
                return (existing.Count + 1, existing.WindowStart);
            });

        return entry.Count <= maxPerWindow;
    }
}