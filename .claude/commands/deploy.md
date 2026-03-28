---
name: deploy
description: "Build, deploy to Cloud Functions, and verify"
allowed-tools: Bash, Read
---

Deploy KC PP Sync to Google Cloud Functions:

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

4. If tests pass, deploy:
```bash
gcloud functions deploy kc-pp-sync \
  --gen2 --runtime nodejs22 --region us-central1 \
  --source . --entry-point kcPPSync \
  --trigger-http --allow-unauthenticated \
  --memory 512MB --cpu 0.3333 --timeout 180s --max-instances 1
```

5. Verify deployment:
```bash
gcloud functions describe kc-pp-sync --region us-central1 --format="value(state)"
```

6. Report: test results, deploy status, function state.

If tests fail, stop and report. Do not deploy with failing tests.
