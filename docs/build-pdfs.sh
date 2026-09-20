#!/bin/bash
# Regenerates the two printed documents from their HTML sources in docs/.
#
#   bash docs/build-pdfs.sh
#
# Needs Microsoft Edge or Chrome (headless print-to-PDF). Override the
# browser with BROWSER=/path/to/chrome. Fonts and logos are stored in
# docs/assets/, so it works offline.
set -euo pipefail

docs_dir="$(cd "$(dirname "$0")" && pwd)"
root_dir="$(dirname "$docs_dir")"
browser="${BROWSER:-/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe}"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

build() {
  local source="$1" target="$2"
  "$browser" --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=8000 \
    --print-to-pdf="$tmp_dir/out.pdf" "file:///$(cd "$docs_dir" && pwd -W 2>/dev/null || pwd)/$source" \
    >/dev/null 2>&1
  cp "$tmp_dir/out.pdf" "$root_dir/$target"
  echo "wrote $target"
}

build one-pager.html AIwareness-Global-Shapers-Valencia.pdf
build hub-onboarding-guide.html AIwareness-Hub-Onboarding-Guide.pdf
