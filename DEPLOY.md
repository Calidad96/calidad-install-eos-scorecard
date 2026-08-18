# Install EOS Scorecard — Deployment Guide

**GitHub repo:** `Calidad96/calidad-install-eos-scorecard`

---

## What you get

| Piece | Purpose |
|-------|---------|
| **Dashboard** (Vercel) | Install EOS scorecard UI with login |
| **GitHub Actions** | Daily auto-sync + manual workflow run |
| **Monday hub boards** | `[SYNC] Install …` in workspace `16379553` |

---

## Step 1 — GitHub repo (done)

Code lives at: https://github.com/Calidad96/calidad-install-eos-scorecard

---

## Step 2 — GitHub Actions secret (auto sync)

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. Secret name: **`MONDAY_API_TOKEN`**
3. Value: your Monday API token

**Test:** Actions → **Sync Install scorecard** → **Run workflow**

Daily cron: **~6:00 AM Pacific** (13:00 UTC).

---

## Step 3 — Deploy dashboard on Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. **Root Directory:** `dashboard`
3. Environment variables:

| Variable | Required | Notes |
|----------|----------|--------|
| `MONDAY_API_TOKEN` | Yes | Reads hub boards |
| `DASHBOARD_AUTH_EMAIL` | Yes | Login email |
| `DASHBOARD_AUTH_PASSWORD` | Yes | Login password |
| `AUTH_SECRET` | Yes | Random string (32+ chars) for session cookies |
| `GITHUB_REPO` | Optional | Default: `Calidad96/calidad-install-eos-scorecard` |
| `GITHUB_SYNC_TOKEN` | Optional | Enables in-dashboard “Update data now” button |

4. Deploy, then **Redeploy** after adding env vars

**Generate AUTH_SECRET** (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Step 4 — Login

After setting auth env vars and redeploying:

1. Visit your Vercel URL — you should see the **Install Scorecard** login page
2. Sign in with `DASHBOARD_AUTH_EMAIL` and `DASHBOARD_AUTH_PASSWORD`
3. **Sign out** is in the sidebar footer

---

## Step 5 — Manual sync (no developer token needed)

You do **not** need GitHub Developer Settings or a PAT unless you want the dashboard sync button.

**Manual sync without PAT:**

1. GitHub repo → **Actions**
2. **Sync Install scorecard** → **Run workflow**

Daily auto-sync still runs on schedule.

---

## Step 6 — Optional: dashboard “Update data now” button

Only if you want the button inside the dashboard (not required):

1. GitHub profile photo (top-right) → **Settings** → **Developer settings** → **Fine-grained tokens**
2. Token scoped to `calidad-install-eos-scorecard`, **Actions: Read and write**
3. Add as `GITHUB_SYNC_TOKEN` on Vercel → Redeploy

---

## Verify

1. Login page appears before dashboard
2. All tabs load after sign-in
3. **Sync & Data** shows successful sync history
4. GitHub Actions runs daily or on manual trigger

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Dashboard open without login | Add `DASHBOARD_AUTH_PASSWORD` + `AUTH_SECRET` on Vercel, redeploy |
| Login fails | Check email matches `DASHBOARD_AUTH_EMAIL` exactly |
| Empty data | Check `MONDAY_API_TOKEN` on Vercel |
| Sync fails on GitHub | Add `MONDAY_API_TOKEN` in GitHub Actions secrets |
