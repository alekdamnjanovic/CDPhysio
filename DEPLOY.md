# CD Physio — Deployment Guide

Everything you need to know to update, keep alive, and manage the live website.

## Live site

**URL:** https://cdphysio.onrender.com

The site is a single deployment on Render's free tier. One container serves both the
Angular frontend (built SPA) and the .NET API through Kestrel — no nginx, no extra services.

- Angular build is copied into the server's `wwwroot` (see `Dockerfile.render`).
- `Program.cs` uses `UseDefaultFiles()` / `UseStaticFiles()` + `MapFallbackToFile("index.html")`
  so Kestrel serves the SPA and the `/api/*` endpoints from one port.

## Updating the live site (your edit loop)

1. Make your code changes locally (frontend in `client/`, backend in `server/`).
2. Commit and push to GitHub:

   ```powershell
   git add -A
   git commit -m "describe your change"
   git push origin master
   ```

3. Render auto-detects the push and rebuilds + redeploys (first build ~3–6 min, later builds faster).
4. Refresh `https://cdphysio.onrender.com` to see the update.

Auto-deploy is enabled by default. To check: Render dashboard → service → **Settings** →
**Auto-Deploy** → "Deploy on push" should be on.

## Keeping it awake (important for the free tier)

Render's free web service spins down after ~15 minutes with no traffic. The next visitor then
waits ~30–60s for a cold start. Fix: a free keepalive ping every 5 minutes keeps it warm 24/7
(well within the 750 free instance-hours/month).

**Setup (one time):**

1. Go to https://cron-job.org → create a free account.
2. Dashboard → **New Cronjob**:
   - **Job title:** anything, e.g. "CD Physio keepalive"
   - **URL:** `https://cdphysio.onrender.com/`
   - **Execution:** type "cron", schedule every **5 minutes** (e.g. `*/5 * * * *`)
   - **Save**
3. Optional: enable the free email alert so you're notified if the site goes down.

**Backup keepalive:** a GitHub Actions workflow (`.github/workflows/keepalive.yml`) also pings the
site every 5 minutes. Note: GitHub's `schedule` event is unreliable (runs are often delayed several
minutes), so it is kept only as a backup — cron-job.org is the primary keepalive.

## Render environment variables

Set in Render dashboard → service → **Environment**. The `__` maps to the config keys the
backend reads (e.g. `ConnectionStrings__Default` → `ConnectionStrings:Default`).

| Key | Value | Required |
| --- | --- | --- |
| `ConnectionStrings__Default` | Supabase pooler connection string (`Host=aws-0-us-west-2.pooler.supabase.com;...;SSL Mode=Require;Trust Server Certificate=true`) | Yes |
| `Reviews__AdminKey` | Admin panel access key | Yes |
| `Ai__ApiKey` | Groq API key (`gsk_...`) | Yes |
| `Ai__BaseUrl` | `https://api.groq.com/openai/v1` | No (has default) |
| `Ai__Model` | `llama-3.3-70b-versatile` | No (has default) |
| `ASPNETCORE_ENVIRONMENT` | `Production` | No (set in `render.yaml`) |

The Supabase password contains `%` and `#` — paste it exactly as-is (do not URL-encode).
These same values live in the local `.env` file, which is gitignored.

## Pausing / stopping / deleting the site

The site keeps running as long as the Render service exists — it is independent of your PC
and browser. To control it:

- **Pause (stop serving, keep config):** Render dashboard → service → **Pause**.
- **Restart:** service → **Manual Deploy → Deploy latest commit**.
- **Delete (permanent):** service → **Settings** → **Delete Service**. This also stops the
  keepalive ping from mattering; the GitHub repo and Render env vars are the only remaining
  copies of the config.

## Local development still works

`docker compose up --build` locally still uses the original nginx + backend setup
(`client/nginx.conf`, `server/Dockerfile`). The Render deployment (`Dockerfile.render`,
`render.yaml`, Kestrel static files) is a separate path and does not affect local dev.

## Deployment files in the repo

- `Dockerfile.render` — multi-stage build: Angular (node) → `wwwroot`, then .NET publish → runtime image.
- `render.yaml` — Render Blueprint defining the free web service + env vars.
- `server/Program.cs` — serves static SPA files + `/api` (the static-file lines are the Render-specific part).

## Optional future improvements

- **Custom domain:** free tier supports attaching your own domain (set in Render → Settings → Custom Domains).
- **No cold starts ever:** upgrade the Render service to a paid plan, or point a CDN in front.
- **Zero-downtime deployments:** paid Render tiers give zero-downtime deploys; free tier has a brief
  gap during redeploy.