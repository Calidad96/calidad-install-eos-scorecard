# Install EOS Scorecard — Deployment Guide

**Recommended GitHub repo:** `Calidad96/calidad-install-eos-scorecard`  
(Separate from `calidad-soc-stos-dashboard`)

---

## What you get

| Piece | Purpose |
|-------|---------|
| **Dashboard** (Vercel) | Install EOS scorecard UI |
| **GitHub Actions** | Daily auto-sync + manual sync (same as SOC/STOS) |
| **Monday hub boards** | `[SYNC] Install …` in workspace `16379553` |

---

## Step 1 — Create GitHub repo

1. Go to GitHub → **New repository**
2. Name: **`calidad-install-eos-scorecard`**
3. Private repo (recommended)
4. Do **not** add README (we already have one)

Push the `install-scorecard` folder:

```powershell
cd "C:\Users\Zubair\Documents\JAY - DASHBAORD - DEVELOPMENT\install-scorecard"
git init
git add .
git commit -m "Initial Install EOS scorecard"
git branch -M main
git remote add origin https://github.com/Calidad96/calidad-install-eos-scorecard.git
git push -u origin main
```

*(Replace `Calidad96` with your GitHub org/user if different.)*

---

## Step 2 — GitHub Actions secret (auto sync)

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: `MONDAY_API_TOKEN`
4. Value: your Monday API token (same as SOC dashboard)

**Test:** Actions → **Sync Install scorecard** → **Run workflow**  
Expect: green check, ~200+ items synced.

Daily cron: **6:00 AM Pacific** (13:00 UTC).

---

## Step 3 — Deploy dashboard on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Import **`calidad-install-eos-scorecard`**
3. **Root Directory:** `dashboard` ← important
4. Framework: Next.js (auto-detected)
5. **Environment variables:**

| Variable | Required | Where |
|----------|----------|--------|
| `MONDAY_API_TOKEN` | Yes | Vercel + GitHub secret |
| `GITHUB_SYNC_TOKEN` | For "Update data now" button | Vercel only |
| `GITHUB_REPO` | Optional | `Calidad96/calidad-install-eos-scorecard` |

6. Deploy

---

## Step 4 — GitHub PAT for dashboard sync button

Create a **fine-grained** Personal Access Token:

- Repository access: `calidad-install-eos-scorecard`
- Permissions: **Actions** → Read and write

Add to **Vercel** as `GITHUB_SYNC_TOKEN`, then **Redeploy**.

Without this token, sync still runs on schedule via GitHub — only the in-dashboard button won't work.

---

## Step 5 — Verify

1. Open your Vercel URL
2. Go to **Sync & Data** tab
3. Click **Update data now**
4. Open GitHub Actions — run should be **in progress**
5. After ~5–15 min, refresh dashboard — data updated

---

## Local development

```bash
# Root — sync scripts
cp .env.example .env
npm install
npm run sync

# Dashboard
cd dashboard
cp .env.example .env.local
npm install
npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Dashboard empty / error | Check `MONDAY_API_TOKEN` on Vercel |
| "Update data now" fails | Add `GITHUB_SYNC_TOKEN` on Vercel, redeploy |
| GitHub Action fails | Add `MONDAY_API_TOKEN` in GitHub Actions secrets |
| Wrong repo for sync button | Set `GITHUB_REPO=owner/repo` on Vercel |

---

## Suggested Vercel project name

`calidad-install-eos-scorecard` or `install-eos-scorecard`
