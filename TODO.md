# TODO - Kosodate Bot

各タスクを上から1個ずつ消化。完了したら `[x]`。
SPEC.md v1_0 を必ず参照。各タスクで commit。

## Phase 1: プロジェクト初期化
- [ ] T001: Next.js 14 + TypeScript + Tailwindで初期化 (npx create-next-app, App Router使用)
- [ ] T002: shadcn/ui 初期化
- [ ] T003: .env.local.example作成、必要な環境変数を全部記載
- [ ] T004: README.md作成、セットアップ手順を書く

## Phase 2: 認証
- [ ] T005: NextAuth.js セットアップ (Google認証 + メール認証)
- [ ] T006: ログイン画面UI
- [ ] T007: ログイン状態のミドルウェア (未ログインは/loginへ)

## Phase 3: DB
- [ ] T008: Vercel KV クライアント設定 (lib/db.ts)
- [ ] T009: ユーザーモデル (id/email/plan/usage_count/created_at)
- [ ] T010: 相談履歴モデル (id/user_id/message/response/tags/created_at)
- [ ] T011: 子どもプロファイルモデル (id/user_id/age/notes/interests/difficulties)

## Phase 4: AI相談コア
- [ ] T012: lib/claude.ts でClaude APIクライアント (Anthropic SDK)
- [ ] T013: lib/prompts.ts でシステムプロンプト (教育心理・発達心理ベースの相談相手)
- [ ] T014: POST /api/chat エンドポイント (認証チェック、レート制限、Claude呼び出し)
- [ ] T015: トークン上限1,500の応答制御
- [ ] T016: 月次相談回数のカウントとリセット処理

## Phase 5: UI
- [ ] T017: メイン画面レイアウト (左サイドバーにメニュー、右に相談画面)
- [ ] T018: 相談画面 (チャット風UI、メッセージ送信、ストリーミング表示)
- [ ] T019: 履歴画面 (時系列リスト、タグ検索)
- [ ] T020: 子どもプロファイル編集画面
- [ ] T021: ダッシュボード (残り相談回数・よくあるテーマ)
- [ ] T022: 設定画面 (アカウント・プラン・ログアウト)

## Phase 6: タグ自動付与
- [ ] T023: 相談保存時にClaudeで自動タグ生成
- [ ] T024: 履歴検索でタグフィルタリング

## Phase 7: コンテキスト連携
- [ ] T025: 子どもプロファイルを相談プロンプトに自動付与
- [ ] T026: 過去の相談履歴を直近3件分コンテキストに含める

## Phase 8: 課金
- [ ] T027: Stripe Checkout セッション作成 (POST /api/stripe/checkout)
- [ ] T028: Stripe Webhook (POST /api/stripe/webhook で plan更新)
- [ ] T029: プラン切替UI (無料↔有料)

## Phase 9: 週次配信
- [ ] T030: Vercel Cronで毎週月曜朝に「今週の声かけのヒント」をAI生成して保存
- [ ] T031: ダッシュボードに今週のヒント表示

## Phase 10: 仕上げ
- [ ] T032: 全ページのSEO設定 (title, description, OGP)
- [ ] T033: エラーハンドリング、ユーザー向けエラー表示
- [ ] T034: ロゴ・カラー・ファビコン (シンプルでOK)
- [ ] T035: ランディングページ作成 (/ にサービス紹介・料金・申込ボタン)

## Phase 11: デプロイ
- [ ] T036: Vercelプロジェクト作成
- [ ] T037: 環境変数設定 (ローカルから値をコピペ前提でREADMEに手順を書く)
- [ ] T038: vercel.json 設定 (cron設定含む)
- [ ] T039: デプロイ確認、本番URLでログイン→相談→課金まで一通り動くことを確認
