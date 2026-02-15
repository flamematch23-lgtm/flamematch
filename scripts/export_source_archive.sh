#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist"
ARCHIVE_NAME="flamematch-source-$(date +%Y%m%d-%H%M%S).tar.gz"
ARCHIVE_PATH="$OUT_DIR/$ARCHIVE_NAME"

mkdir -p "$OUT_DIR"

# Esporta il codice sorgente escludendo artefatti di build e metadati git.
tar \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='android/.gradle' \
  --exclude='android/build' \
  --exclude='android/app/build' \
  --exclude='node_modules' \
  -czf "$ARCHIVE_PATH" \
  -C "$ROOT_DIR" .

printf 'Archivio creato: %s\n' "$ARCHIVE_PATH"
