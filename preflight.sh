#!/usr/bin/env bash
# Run this right before the presentation. Checks everything end to end.
cd "$(dirname "$0")"
FAIL=0
ok(){ printf "  ok    %s\n" "$1"; }
bad(){ printf "  FAIL  %s\n" "$1"; FAIL=1; }

echo "Scout preflight"

[ -f dist/code.js ] && [ -f dist/ui.html ] && ok "plugin is built" || bad "plugin is not built (run: npm run build)"

CODE=$(grep '^SCOUT_ACCESS_CODE=' worker/.dev.vars 2>/dev/null | cut -d= -f2)
[ -n "$CODE" ] && ok "access code is set" || bad "no access code in worker/.dev.vars"

curl -fsS --max-time 5 http://localhost:8787/health >/dev/null 2>&1 \
  && ok "server is up" || bad "server is down (run: ./demo.sh)"

S=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 -X POST http://localhost:8787/eval \
      -H 'x-scout-code: definitely-wrong' -H 'content-type: application/json' -d '{}')
[ "$S" = "401" ] && ok "access gate rejects a bad code" || bad "access gate returned $S, expected 401"

echo "  ..    running a real evaluation, this takes about 90s"
OUT=$(node worker/test/smoke.mjs test-assets/checkout.png --route eval --platform ios --code "$CODE" 2>&1)
N=$(echo "$OUT" | grep -o 'findings: [0-9]*' | grep -o '[0-9]*' | head -1)
if [ -n "$N" ] && [ "$N" -ge 6 ]; then ok "evaluation returned $N findings"
else bad "evaluation failed or was thin"; echo "$OUT" | tail -6 | sed 's/^/        /'; fi

echo
[ $FAIL -eq 0 ] && echo "All good. Go present." || echo "Fix the failures above."
exit $FAIL
