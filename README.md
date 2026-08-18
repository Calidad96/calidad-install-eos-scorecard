# Install EOS Scorecard

Separate from SOC/STOS — unified **Install** department EOS L10 scorecard.

**Repo name:** `calidad-install-eos-scorecard`  
**Full deploy guide:** [DEPLOY.md](./DEPLOY.md)

## Quick start

```bash
npm install && npm run sync
cd dashboard && npm install && npm run dev
```

## Auto sync

- **Daily:** GitHub Actions cron (~6 AM Pacific)
- **Manual:** Dashboard → Sync & Data → **Update data now**
- Same architecture as SOC/STOS (GitHub Actions, not Vercel)

## Source boards

| EOS | Board | ID |
|-----|-------|-----|
| 1 | Accountability Chart | 18425615142 |
| 2 | Weekly Scorecard | 18425615152 |
| 3 | Rocks | 18425632638 |
| 4 | To-Dos | 18415782228 |
| 5 | CAPA/IDS | 18425615173 |
| 6 | SOP Manager | 18425640592 |
