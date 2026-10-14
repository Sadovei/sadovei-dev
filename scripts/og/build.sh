#!/bin/bash
# Regenerates public/og.png (1200x630), the preview image for LinkedIn and other link shares.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=3000 --screenshot="$DIR/../../public/og.png" "file://$DIR/og.html" 2>/dev/null
echo "public/og.png"
