# GitHub Actions Workflows

## etl-monthly.yml

Automated monthly ETL pipeline to keep the vehicle database updated with latest FIPE prices and Inmetro efficiency data.

### Schedule

- **Automatic**: Runs on the 1st of each month at 2:00 AM UTC
- **Manual**: Can be triggered via workflow_dispatch with optional parameters:
  - `skip_fipe`: Skip FIPE ETL (useful if FIPE data is unchanged)
  - `skip_inmetro`: Skip Inmetro ETL (useful if efficiency data is unchanged)

### Pipeline Jobs

1. **fipe-etl**: Fetches latest vehicle prices from Brasil API
2. **inmetro-etl**: Fetches latest fuel efficiency data from Inmetro PBE
3. **cross-reference**: Matches FIPE and Inmetro data into unified vehicles table
4. **validate**: Validates data quality and consistency
5. **notify**: Sends Slack notification with results

### Required Secrets

```bash
# Database connection
NEON_DATABASE_URL=postgresql://user:pass@neon-host/db

# Optional: Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Running Locally

```bash
# Trigger manually via GitHub CLI
gh workflow run etl-monthly.yml

# Or with parameters
gh workflow run etl-monthly.yml -f skip_inmetro=true
```

### Logs

Each job uploads logs as artifacts with 30-day retention. Access via:
- GitHub Actions UI → Artifacts section
- Or via API: `gh run download <run-id> -n fipe-etl-logs-<run-id>`

### Troubleshooting

**Job fails with database connection error:**
- Verify `NEON_DATABASE_URL` secret is set correctly
- Check Neon.tech connection limits (free tier: 10 concurrent)

**Slack notifications not received:**
- Verify `SLACK_WEBHOOK_URL` is set (optional)
- Check webhook URL is valid in Slack app settings

**ETL takes too long:**
- Enable batch mode: Set `ETL_BATCH_MODE=true` in repository secrets
- Reduce batch size: Set `ETL_BATCH_SIZE=5` (default: 10)

### Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  FIPE ETL   │───▶│ Inmetro ETL │───▶│ Cross-Ref   │
│  (30 min)   │    │  (20 min)   │    │  (15 min)   │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                               │
                                       ┌───────▼───────┐
                                       │   Validate    │
                                       │   (10 min)    │
                                       └───────┬───────┘
                                               │
                                       ┌───────▼───────┐
                                       │    Notify     │
                                       └───────────────┘
```

### Monitoring

- Check workflow status: https://github.com/{owner}/{repo}/actions/workflows/etl-monthly.yml
- View last run: `gh run list --workflow=etl-monthly.yml`
- Download logs: `gh run download <run-id>`

---

## Maintenance

### Updating Schedule

Edit the cron expression in `etl-monthly.yml`:
```yaml
on:
  schedule:
    - cron: '0 2 1 * *'  # Current: 1st of month at 2 AM UTC
```

Use [crontab.guru](https://crontab.guru/) to generate new schedules.

### Adding New Jobs

1. Add job definition after existing jobs
2. Use `needs:` to establish dependencies
3. Add artifact upload for logs
4. Update this README
