#!/bin/bash
PROJ_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJ_NAME=$(basename "$PROJ_DIR")
cd "$PROJ_DIR" || exit 1
mkdir -p logs
LOOP_COUNT=0
MAX_LOOPS=200
while [ $LOOP_COUNT -lt $MAX_LOOPS ]; do
  LOOP_COUNT=$((LOOP_COUNT + 1))
  REM=$(grep -c "^- \[ \]" TODO.md 2>/dev/null | head -1)
  REM=${REM:-0}
  if [ "$REM" -le 0 ]; then
    echo "[$PROJ_NAME] 完了" | tee -a logs/codex_$(date +%Y%m%d).log
    break
  fi
  echo "[$(date '+%H:%M:%S')] [$PROJ_NAME L$LOOP_COUNT] 残$REM" | tee -a logs/codex_$(date +%Y%m%d).log

  PROMPT="Autonomous agent for $PROJ_NAME (Next.js 14 + Supabase + OpenAI SaaS). User is asleep.

CRITICAL: npm install is ALREADY DONE. node_modules exists. DO NOT run 'npm install'.
If you think you need a new package: just edit package.json and DOCUMENT in commit msg that npm install is needed later. Do not actually run install.

Steps:
1. Read SPEC.md
2. Pick FIRST '- [ ]' in TODO.md
3. Implement directly (NO questions, NO plan proposals)
4. If task requires real API keys (.env.local has dummy), still implement the code but mark commit msg '[needs real keys to test]'
5. Mark task [x] in TODO.md
6. 'git add -A && git commit -m \"Txxx: <summary>\"' then 'git push origin main' (best-effort, skip if fails)
7. Exit

NO npm install. NO sync questions. NO plan mode."

  gtimeout 900 codex exec "$PROMPT" 2>&1 | tee -a logs/codex_$(date +%Y%m%d).log
  RC=${PIPESTATUS[0]}
  [ "$RC" -ne 0 ] && [ "$RC" -ne 101 ] && sleep 180 || sleep 8
done
