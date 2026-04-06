---
name: deploy
description: "Build, deploy to Cloud Run, and verify"
allowed-tools: Bash, Read
---

Deploy KC PP Sync to Google Cloud Run:

1. Check for uncommitted changes: `git status --short`
   - If dirty, list the changes and ask whether to commit first

2. Build TypeScript:
```bash
npm run build
```

3. Run tests:
```bash
npm test
```

4. If tests pass, deploy to Cloud Run:
```bash
gcloud run deploy kc-pp-sync \
  --source . \
  --region us-central1 \
  --project aya-gservicies \
  --no-allow-unauthenticated \
  --memory 512Mi \
  --cpu 0.1666 \
  --timeout 300 \
  --max-instances 1
```

5. Verify deployment:
```bash
gcloud run services describe kc-pp-sync \
  --region us-central1 \
  --project aya-gservicies \
  --format="value(status.latestReadyRevisionName)"
```

6. Report: test results, deploy status, new revision name.

If tests fail, stop and report. Do not deploy with failing tests.

**Note:** This is Cloud Run, NOT Cloud Functions. Do not use `gcloud functions deploy`.
