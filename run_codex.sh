#!/bin/bash
# kosodate-bot を Codex CLI で無限自走させるスクリプト
# 使い方: caffeinate -i bash run_codex.sh

set -u

EXPECTED_DIR="$HOME/Documents/kosodate-bot"
CURRENT_DIR="$(pwd)"

if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
  echo "❌ 指定外ディレクトリ: $CURRENT_DIR (期待: $EXPECTED_DIR)"
  exit 1
fi

if [ ! -f "SPEC.md" ] || [ ! -f "TODO.md" ]; then
  echo "❌ SPEC.md または TODO.md なし。停止。"
  exit 1
fi

LOG_DIR="logs"
mkdir -p "$LOG_DIR"
RUN_LOG="$LOG_DIR/run_$(date +%Y%m%d_%H%M%S).log"
echo "▶ 開始: $(date)" | tee "$RUN_LOG"
echo "▶ 作業ディレクトリ: $CURRENT_DIR" | tee -a "$RUN_LOG"

if [ ! -d ".git" ]; then
  git init -q
  git config user.email "kosodate-bot@local"
  git config user.name "Kosodate Bot"
  git add -A
  git commit -q -m "initial: spec v1_0 and todo" || true
fi

SAFE_COMMIT=$(git rev-parse HEAD)
CONSECUTIVE_ERRORS=0
MAX_CONSECUTIVE_ERRORS=3

ITERATION=0
MAX_ITERATIONS=500

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo "" | tee -a "$RUN_LOG"
  echo "===== 反復 $ITERATION : $(date) =====" | tee -a "$RUN_LOG"

  REMAINING=$(grep -c '^\- \[ \]' TODO.md 2>/dev/null || echo 0)
  echo "残タスク数: $REMAINING" | tee -a "$RUN_LOG"

  if [ "$REMAINING" -gt 0 ]; then
    MODE="normal"
    PROMPT=$(cat <<'EOF'
あなたは kosodate-bot プロジェクトの完全自律開発エージェントです。

【最重要原則】
- 絶対にユーザーに質問しない。全部自分で判断して実装する。
- 詰まったら30秒以内にスキップして次へ。完璧主義で止まるな。
- 迷ったらSPEC.mdの方針に従い、それでも迷ったら一般的なベストプラクティス。

【絶対禁止】
- このディレクトリ外への書き込み・削除
- rm -rf / cd .. による他ディレクトリ操作
- git push / git remote 関連
- ネットワーク経由のファイル送信
- 外部API呼び出し(課金リスク)
- システム設定変更

【許可】
- このディレクトリ内のファイル全部
- npm install (プロジェクトローカル)
- ローカル git commit
- リファクタ・命名変更 (自己責任)

【手順】
1. SPEC.md で仕様確認
2. TODO.md の最初の `- [ ]` を1つ選ぶ
3. 実装する。詰まったらスキップ可。スキップは行末に " [SKIP: 理由]" を追記して `[ ]` のまま残す
4. TODO.md の該当行を `[x]` に変更 (スキップは [ ] のまま)
5. `git add -A && git commit -m "Txxx: <内容>"` を実行
6. 1行で完了報告して終了

【自走原則】
- ユーザーに質問しない
- 寝てる前提
- エラー3回で諦めてスキップ
EOF
)
  else
    MODE="autogen"
    PROMPT=$(cat <<'EOF'
あなたは kosodate-bot プロジェクトの完全自律開発エージェントです。
指定タスクは全完了。自己生成モード。

【禁止】絶対にユーザーに質問しない。外部書き込み禁止。

【自己生成のアイデア】
- UIの磨き込み
- パフォーマンス改善
- エラーハンドリング強化
- テスト追加
- ドキュメント追加
- セキュリティ強化(rate limit, CSRF対策など)
- アクセシビリティ
- モバイル対応強化
- 多言語対応の枠だけ

【手順】
1. 「次に一番効く改善」を自分で1つ決める
2. 実装する
3. TODO.md末尾の自己生成タスクセクションに `- [x] AUTO: <内容>` を追記
4. `git add -A && git commit -m "AUTO: <内容>"` を実行
5. 1行で完了報告して終了
EOF
)
  fi

  echo "モード: $MODE" | tee -a "$RUN_LOG"

  COMMIT_BEFORE=$(git rev-parse HEAD)

  # Codex CLI を非対話で実行 (自動承認モード)
  codex exec --skip-git-repo-check --full-auto "$PROMPT" \
    2>&1 | tee -a "$RUN_LOG"

  EXIT_CODE=${PIPESTATUS[0]}
  COMMIT_AFTER=$(git rev-parse HEAD)
  echo "codex終了コード: $EXIT_CODE" | tee -a "$RUN_LOG"

  if [ "$COMMIT_BEFORE" != "$COMMIT_AFTER" ]; then
    SAFE_COMMIT=$COMMIT_AFTER
    CONSECUTIVE_ERRORS=0
    echo "✓ 進捗あり: $COMMIT_AFTER" | tee -a "$RUN_LOG"
  else
    CONSECUTIVE_ERRORS=$((CONSECUTIVE_ERRORS + 1))
    echo "⚠ 進捗なし(連続$CONSECUTIVE_ERRORS回)" | tee -a "$RUN_LOG"

    if [ $CONSECUTIVE_ERRORS -ge $MAX_CONSECUTIVE_ERRORS ]; then
      echo "⚠ 連続失敗${MAX_CONSECUTIVE_ERRORS}回。セーフポイントへreset。" | tee -a "$RUN_LOG"
      git reset --hard "$SAFE_COMMIT" | tee -a "$RUN_LOG"
      git clean -fd | tee -a "$RUN_LOG"
      CONSECUTIVE_ERRORS=0
    fi
  fi

  sleep 2
done

echo "" | tee -a "$RUN_LOG"
echo "▶ 終了: $(date)" | tee -a "$RUN_LOG"
echo "▶ 反復回数: $ITERATION" | tee -a "$RUN_LOG"
git log --oneline -30 | tee -a "$RUN_LOG"
