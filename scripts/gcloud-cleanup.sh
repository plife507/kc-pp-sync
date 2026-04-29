#!/usr/bin/env bash
# KC PP Sync - GCloud cleanup helper.
#
# Dry-run by default. Artifact cleanup is scoped to the kc-pp-sync image.
# Secret cleanup is opt-in because secrets are shared operational state.
#
# Usage:
#   ./scripts/gcloud-cleanup.sh
#   ./scripts/gcloud-cleanup.sh --execute
#   ./scripts/gcloud-cleanup.sh --include-secrets
#   ./scripts/gcloud-cleanup.sh --execute --include-secrets

set -euo pipefail

PROJECT="aya-gservicies"
REPO="gcf-artifacts"
IMAGE_PATH="us-central1-docker.pkg.dev/${PROJECT}/${REPO}/kc-pp-sync"
KEEP_IMAGES=3

DRY_RUN=true
INCLUDE_SECRETS=false

for arg in "$@"; do
  case "$arg" in
    --execute) DRY_RUN=false ;;
    --include-secrets) INCLUDE_SECRETS=true ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

count_lines() {
  grep -c . 2>/dev/null || true
}

mode_label() {
  if $DRY_RUN; then
    echo "DRY RUN"
  else
    echo "EXECUTE"
  fi
}

echo "================================================"
echo "  GCloud Cleanup - KC PP Sync"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Mode: $(mode_label)"
echo "================================================"
echo ""

echo "Artifact Registry Cleanup"
echo "   Image: ${IMAGE_PATH}"
echo "   Keeping newest ${KEEP_IMAGES} images"
echo ""

ALL_DIGESTS=$(gcloud artifacts docker images list "$IMAGE_PATH" \
  --project="$PROJECT" \
  --sort-by=~CREATE_TIME \
  --format="value(DIGEST)" 2>/dev/null | grep -v "cache" || true)

TOTAL=$(echo "$ALL_DIGESTS" | count_lines)
echo "   Total images: ${TOTAL}"

if [[ $TOTAL -le $KEEP_IMAGES ]]; then
  echo "   Already clean"
else
  DELETE_COUNT=$((TOTAL - KEEP_IMAGES))
  echo "   Will delete: ${DELETE_COUNT} old images"

  DIGESTS_TO_DELETE=$(echo "$ALL_DIGESTS" | tail -n +"$((KEEP_IMAGES + 1))")

  while IFS= read -r digest; do
    if [[ -z "$digest" ]]; then continue; fi
    if $DRY_RUN; then
      echo "   [DRY RUN] Would delete: ${digest:0:20}..."
    else
      echo "   Deleting: ${digest:0:20}..."
      gcloud artifacts docker images delete "${IMAGE_PATH}@${digest}" \
        --project="$PROJECT" \
        --quiet --delete-tags 2>/dev/null || echo "   Failed to delete ${digest:0:20}"
    fi
  done <<< "$DIGESTS_TO_DELETE"
fi

echo ""

if ! $INCLUDE_SECRETS; then
  echo "Secret Manager Cleanup"
  echo "   Skipped. Pass --include-secrets to dry-run secret-version cleanup."
  echo ""
  echo "================================================"
  if $DRY_RUN; then
    echo "  DRY RUN complete. Run with --execute to apply artifact cleanup."
  else
    echo "  Cleanup complete."
  fi
  echo "================================================"
  exit 0
fi

echo "Secret Manager Cleanup"
echo "   Scope: kc-pp-sync runtime secrets only"
echo "   Keeping highest-numbered enabled version per secret"
echo ""

PP_SECRETS=(
  HEYPROS_EMAIL
  HEYPROS_PASSWORD
  JOBBER_ACCESS_TOKEN
  JOBBER_CLIENT_ID
  JOBBER_CLIENT_SECRET
  JOBBER_REFRESH_TOKEN
  TELEGRAM_BOT_TOKEN
)

DISABLED_COUNT=0
for secret in "${PP_SECRETS[@]}"; do
  if ! gcloud secrets describe "$secret" --project="$PROJECT" >/dev/null 2>&1; then
    echo "   Missing secret, skipping: ${secret}"
    continue
  fi

  VERSIONS=$(gcloud secrets versions list "$secret" \
    --project="$PROJECT" \
    --filter="state=ENABLED" \
    --format="value(name)" 2>/dev/null | sort -nr || true)

  VERSION_COUNT=$(echo "$VERSIONS" | count_lines)
  if [[ $VERSION_COUNT -le 1 ]]; then
    continue
  fi

  OLD_VERSIONS=$(echo "$VERSIONS" | tail -n +2)
  while IFS= read -r ver; do
    if [[ -z "$ver" ]]; then continue; fi
    if $DRY_RUN; then
      echo "   [DRY RUN] Would disable: ${secret} v${ver}"
    else
      echo "   Disabling: ${secret} v${ver}"
      gcloud secrets versions disable "$ver" --secret="$secret" \
        --project="$PROJECT" --quiet 2>/dev/null || echo "   Failed to disable ${secret} v${ver}"
    fi
    DISABLED_COUNT=$((DISABLED_COUNT + 1))
  done <<< "$OLD_VERSIONS"
done

if [[ $DISABLED_COUNT -eq 0 ]]; then
  echo "   Already clean"
fi

echo ""
echo "================================================"
if $DRY_RUN; then
  echo "  DRY RUN complete. Run with --execute to apply."
else
  echo "  Cleanup complete."
fi
echo "================================================"
