# TODO - Kosodate Bot

各タスクを上から1個ずつ消化。完了したら `[x]`。
SPEC.md v1_0 を必ず参照。各タスクで commit。

## Phase 1: プロジェクト初期化
- [x] T001: Next.js 14 + TypeScript + Tailwindで初期化 (npx create-next-app, App Router使用)
- [x] T002: shadcn/ui 初期化
- [x] T003: .env.local.example作成、必要な環境変数を全部記載
- [x] T004: README.md作成、セットアップ手順を書く

## Phase 2: 認証
- [x] T005: NextAuth.js セットアップ (Google認証 + メール認証)
- [x] T006: ログイン画面UI
- [x] T007: ログイン状態のミドルウェア (未ログインは/loginへ)

## Phase 3: DB
- [x] T008: Vercel KV クライアント設定 (lib/db.ts)
- [x] T009: ユーザーモデル (id/email/plan/usage_count/created_at)
- [x] T010: 相談履歴モデル (id/user_id/message/response/tags/created_at)
- [x] T011: 子どもプロファイルモデル (id/user_id/age/notes/interests/difficulties)

## Phase 4: AI相談コア
- [x] T012: lib/claude.ts でClaude APIクライアント (Anthropic SDK)
- [x] T013: lib/prompts.ts でシステムプロンプト (教育心理・発達心理ベースの相談相手)
- [x] T014: POST /api/chat エンドポイント (認証チェック、レート制限、Claude呼び出し)
- [x] T015: トークン上限1,500の応答制御
- [x] T016: 月次相談回数のカウントとリセット処理

## Phase 5: UI
- [x] T017: メイン画面レイアウト (左サイドバーにメニュー、右に相談画面)
- [x] T018: 相談画面 (チャット風UI、メッセージ送信、ストリーミング表示)
- [x] T019: 履歴画面 (時系列リスト、タグ検索)
- [x] T020: 子どもプロファイル編集画面
- [x] T021: ダッシュボード (残り相談回数・よくあるテーマ)
- [x] T022: 設定画面 (アカウント・プラン・ログアウト)

## Phase 6: タグ自動付与
- [x] T023: 相談保存時にClaudeで自動タグ生成
- [x] T024: 履歴検索でタグフィルタリング

## Phase 7: コンテキスト連携
- [x] T025: 子どもプロファイルを相談プロンプトに自動付与
- [x] T026: 過去の相談履歴を直近3件分コンテキストに含める

## Phase 8: 課金
- [x] T027: Stripe Checkout セッション作成 (POST /api/stripe/checkout)
- [x] T028: Stripe Webhook (POST /api/stripe/webhook で plan更新)
- [x] T029: プラン切替UI (無料↔有料)

## Phase 9: 週次配信
- [x] T030: Vercel Cronで毎週月曜朝に「今週の声かけのヒント」をAI生成して保存
- [x] T031: ダッシュボードに今週のヒント表示

## Phase 10: 仕上げ
- [x] T032: 全ページのSEO設定 (title, description, OGP)
- [x] T033: エラーハンドリング、ユーザー向けエラー表示
- [x] T034: ロゴ・カラー・ファビコン (シンプルでOK)
- [x] T035: ランディングページ作成 (/ にサービス紹介・料金・申込ボタン)

## Phase 11: デプロイ
- [x] T036: Vercelプロジェクト作成
- [x] T037: 環境変数設定 (ローカルから値をコピペ前提でREADMEに手順を書く)
- [x] T038: vercel.json 設定 (cron設定含む)
- [x] T039: デプロイ確認、本番URLでログイン→相談→課金まで一通り動くことを確認
