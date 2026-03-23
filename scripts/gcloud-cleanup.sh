#!/usr/bin/env bash
# =============================================================================
# KC PP Sync — GCloud Free Tier Cleanup
# =============================================================================
# Keeps artifact registry and secret manager within free tier limits.
# Safe to run anytime — preserves the latest image and active secret versions.
#
# Usage:
#   ./scripts/gcloud-cleanup.sh              # dry run (shows what would be deleted)
#   ./scripts/gcloud-cleanup.sh --execute    # actually delete
#
# Schedule with cron for automatic maintenance.
# =============================================================================

set -euo pipefail

PROJECT="aya-gservicies"
REGION="us-central1"
REPO="gcf-artifacts"
IMAGE_PATH="us-central1-docker.pkg.dev/${PROJECT}/${REPO}/aya--gservicies__us--central1__kc--pp--sync"
KEEP_IMAGES=3  # keep the 3 most recent images

DRY_RUN=true
if [[ "${1:-}" == "--execute" ]]; then
  DRY_RUN=false
fi

echo "================================================"
echo "  GCloud Free Tier Cleanup — KC PP Sync"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Mode: $(if $DRY_RUN; then echo 'DRY RUN'; else echo 'EXECUTE'; fi)"
echo "================================================"
echo ""

# -------------------------------------------------------
# 1. Artifact Registry — delete old container images
# -------------------------------------------------------
echo "📦 Artifact Registry Cleanup"
echo "   Keeping newest ${KEEP_IMAGES} images, deleting the rest"
echo ""

# Get all image digests sorted by create time (newest first)
ALL_DIGESTS=$(gcloud artifacts docker images list "$IMAGE_PATH" \
  --project="$PROJECT" \
  --sort-by=~CREATE_TIME \
  --format="value(DIGEST)" 2>/dev/null | grep -v "cache" || true)

TOTAL=$(echo "$ALL_DIGESTS" | grep -c . || echo 0)
echo "   Total images: ${TOTAL}"

if [[ $TOTAL -le $KEEP_IMAGES ]]; then
  echo "   ✅ Already clean (≤${KEEP_IMAGES} images)"
else
  DELETE_COUNT=$((TOTAL - KEEP_IMAGES))
  echo "   🗑  Will delete: ${DELETE_COUNT} old images"
  
  # Skip the first KEEP_IMAGES, delete the rest
  DIGESTS_TO_DELETE=$(echo "$ALL_DIGESTS" | tail -n +"$((KEEP_IMAGES + 1))")
  
  while IFS= read -r digest; do
    if [[ -z "$digest" ]]; then continue; fi
    if $DRY_RUN; then
      echo "   [DRY RUN] Would delete: ${digest:0:20}..."
    else
      echo "   Deleting: ${digest:0:20}..."
      gcloud artifacts docker images delete "${IMAGE_PATH}@${digest}" \
        --project="$PROJECT" \
        --quiet --delete-tags 2>/dev/null || echo "   ⚠️  Failed to delete ${digest:0:20}"
    fi
  done <<< "$DIGESTS_TO_DELETE"
fi

# Also clean cache images
CACHE_PATH="${IMAGE_PATH}/cache"
CACHE_DIGESTS=$(gcloud artifacts docker images list "$CACHE_PATH" \
  --project="$PROJECT" \
  --format="value(DIGEST)" 2>/dev/null || true)
CACHE_COUNT=$(echo "$CACHE_DIGESTS" | grep -c . 2>/dev/null || echo 0)

if [[ $CACHE_COUNT -gt 0 ]]; then
  echo ""
  echo "   🗑  Cache images: ${CACHE_COUNT}"
  while IFS= read -r digest; do
    if [[ -z "$digest" ]]; then continue; fi
    if $DRY_RUN; then
      echo "   [DRY RUN] Would delete cache: ${digest:0:20}..."
    else
      echo "   Deleting cache: ${digest:0:20}..."
      gcloud artifacts docker images delete "${CACHE_PATH}@${digest}" \
        --project="$PROJECT" \
        --quiet --delete-tags 2>/dev/null || echo "   ⚠️  Failed to delete cache"
    fi
  done <<< "$CACHE_DIGESTS"
fi

echo ""

# -------------------------------------------------------
# 2. Secret Manager — disable old versions
# -------------------------------------------------------
echo "🔐 Secret Manager Cleanup"
echo "   Disabling old versions (keeping latest active)"
echo ""

SECRETS=$(gcloud secrets list --project="$PROJECT" --format="value(name)" 2>/dev/null)

DISABLED_COUNT=0
for secret in $SECRETS; do
  # Get all enabled versions except the latest
  VERSIONS=$(gcloud secrets versions list "$secret" \
    --project="$PROJECT" \
    --filter="state=ENABLED" \
    --sort-by=~name \
    --format="value(name)" 2>/dev/null)
  
  VERSION_COUNT=$(echo "$VERSIONS" | grep -c . 2>/dev/null || echo 0)
  
  if [[ $VERSION_COUNT -le 1 ]]; then
    continue  # only 1 version, skip
  fi
  
  # Skip the first (latest), disable the rest
  OLD_VERSIONS=$(echo "$VERSIONS" | tail -n +2)
  
  while IFS= read -r ver; do
    if [[ -z "$ver" ]]; then continue; fi
    if $DRY_RUN; then
      echo "   [DRY RUN] Would disable: ${secret} v${ver}"
    else
      echo "   Disabling: ${secret} v${ver}"
      gcloud secrets versions disable "$ver" --secret="$secret" \
        --project="$PROJECT" --quiet 2>/dev/null || echo "   ⚠️  Failed"
    fi
    DISABLED_COUNT=$((DISABLED_COUNT + 1))
  done <<< "$OLD_VERSIONS"
done

if [[ $DISABLED_COUNT -eq 0 ]]; then
  echo "   ✅ Already clean (no old versions)"
fi

echo ""
echo "================================================"
if $DRY_RUN; then
  echo "  DRY RUN complete. Run with --execute to apply."
else
  echo "  ✅ Cleanup complete!"
fi
echo "================================================"
