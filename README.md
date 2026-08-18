# Install EOS Scorecard

Unified **Install** department EOS L10 scorecard.

**Repo:** `Calidad96/calidad-install-eos-scorecard`  
**Deploy guide:** [DEPLOY.md](./DEPLOY.md)

## Quick start

```bash
npm install && npm run sync
cd dashboard && npm install && npm run dev
```

## Auto sync

- **Daily:** GitHub Actions cron (~6 AM Pacific)
- **Manual:** GitHub Actions → Run workflow (or dashboard button if `GITHUB_SYNC_TOKEN` is set)

## Source boards

| EOS | Board | ID |
|-----|-------|-----|
| 1 | Accountability Chart | 18425615142 |
| 2 | Weekly Scorecard | 18425615152 |
| 3 | Rocks | 18425632638 |
| 4 | To-Dos | 18415782228 |
| 5 | CAPA/IDS | 18425615173 |
| 6 | SOP Manager | 18425640592 |
