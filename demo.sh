#!/usr/bin/env bash
# Start everything Scout needs for a live demo. Leave this terminal open.
set -euo pipefail
cd "$(dirname "$0")"

if grep -q "PASTE_YOUR" worker/.dev.vars 2>/dev/null || [ ! -f worker/.dev.vars ]; then
  echo "worker/.dev.vars is missing or still has the placeholder key. Fix that first."
  exit 1
fi

echo "Building the plugin..."
npm run build --silent >/dev/null

echo "Starting the server..."
pkill -f "wrangler dev" 2>/dev/null || true
sleep 1
( cd worker && npx wrangler dev --port 8787 >/tmp/scout-worker.log 2>&1 & )

for _ in $(seq 1 45); do
  if curl -fsS --max-time 2 http://localhost:8787/health >/dev/null 2>&1; then
    echo
    echo "  Scout is ready."
    echo "  Server:      http://localhost:8787"
    echo "  Access code: $(grep '^SCOUT_ACCESS_CODE=' worker/.dev.vars | cut -d= -f2)"
    echo "  Provider:    $(curl -fsS http://localhost:8787/health | sed 's/.*provider":"//;s/".*//')"
    echo
    echo "  In Figma: Plugins > Development > Scout"
    echo "  Server log: tail -f /tmp/scout-worker.log"
    echo
    echo "  Leave this terminal open. Ctrl-C stops the server."
    echo
    # Keep the server in the foreground so closing this window is a deliberate act.
    wait
    exit 0
  fi
  sleep 1
done

echo "Server did not come up. Last 20 lines:"
tail -20 /tmp/scout-worker.log
exit 1
