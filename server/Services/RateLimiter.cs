using System.Collections.Concurrent;

namespace server.Services;

public class RateLimiter : IRateLimiter
{
    private readonly ConcurrentDictionary<string, (int Count, DateTime WindowStart)> _entries = new();
    private DateTime _lastCleanup = DateTime.UtcNow;
    private readonly object _cleanupLock = new();

    public bool IsAllowed(string key, int maxPerWindow, TimeSpan window)
    {
        var now = DateTime.UtcNow;

        // Perform periodic cleanup every 15 minutes to prevent memory leaks from stale IP hashes
        if (now - _lastCleanup > TimeSpan.FromMinutes(15))
        {
            CleanupExpiredEntries(now, window);
        }

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

    private void CleanupExpiredEntries(DateTime now, TimeSpan window)
    {
        if (!Monitor.TryEnter(_cleanupLock)) return;
        try
        {
            _lastCleanup = now;
            var maxAge = window * 2;
            foreach (var kvp in _entries)
            {
                if (now - kvp.Value.WindowStart > maxAge)
                {
                    _entries.TryRemove(kvp.Key, out _);
                }
            }
        }
        finally
        {
            Monitor.Exit(_cleanupLock);
        }
    }
}
